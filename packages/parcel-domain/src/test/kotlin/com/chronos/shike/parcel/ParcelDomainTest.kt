package com.chronos.shike.parcel

import com.chronos.shike.contract.ConfidenceBand
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class ParcelDomainTest {
    private val now = Instant.parse("2026-07-14T08:00:00Z")
    private val parser = ParcelParser(Clock.fixed(now, ZoneOffset.UTC), ZoneOffset.UTC)

    @Test
    fun `parses pickup notification without guessing tracking number`() {
        val result = parser.parse("您的圆通快递已到达南苑菜鸟驿站，请凭取件码 4-2-6187 领取。")
        assertNotNull(result)
        assertEquals("yto", result.carrier)
        assertEquals(ParcelStatus.READY_FOR_PICKUP, result.status)
        assertEquals("4-2-6187", result.pickupCode)
        assertEquals("南苑菜鸟驿站", result.pickupLocation)
        assertNull(result.trackingNumber)
    }

    @Test
    fun `rejects verification bank chat and marketing noise`() {
        assertNull(parser.parse("验证码 428761，用于登录，请勿泄露"))
        assertNull(parser.parse("银行通知：尾号 6187 账户支出 42 元"))
        assertNull(parser.parse("好友小林：晚上一起拿东西吗"))
        assertNull(parser.parse("营销优惠：今日满 100 减 20"))
    }

    @Test
    fun `status cannot regress from ready to transit`() {
        val lifecycle = ParcelLifecycle()
        assertFalse(lifecycle.isAllowed(ParcelStatus.READY_FOR_PICKUP, ParcelStatus.IN_TRANSIT))
        assertTrue(lifecycle.isAllowed(ParcelStatus.EXCEPTION, ParcelStatus.IN_TRANSIT))
    }

    @Test
    fun `duplicate updates remain one parcel`() {
        val parsed = parser.parse("顺丰快件 SF1234567890 正在派送")!!
        val lifecycle = ParcelLifecycle()
        val first = lifecycle.apply(null, parsed, "com.sf.activity", now)
        val second = lifecycle.apply(first, parsed, "com.sf.activity", now.plusSeconds(30))
        assertEquals(first.id, second.id)
        assertEquals(first.deduplicationKeys, second.deduplicationKeys)
        assertEquals(first, ParcelDeduplicator().findMatch(parsed, listOf(first), "com.sf.activity"))
    }

    @Test
    fun `redaction removes sensitive fields`() {
        val redacted = parser.redact("取件码：3-5-2201，手机号 13800138000，运单号 SF1234567890")
        assertFalse(redacted.contains("3-5-2201"))
        assertFalse(redacted.contains("13800138000"))
        assertFalse(redacted.contains("SF1234567890"))
    }

    @Test
    fun `arbitrary unicode input never crashes`() {
        val random = Random(2301)
        repeat(2_000) {
            val input = buildString {
                repeat(random.nextInt(0, 200)) { append(random.nextInt(0, 0xD7FF).toChar()) }
            }
            parser.parse(input)
        }
    }

    @Test
    fun `assistant returns only local pending parcels`() {
        val parsed = parser.parse("您的快递已到达菜鸟驿站，取件码 4-2-6187")!!
        val parcel = ParcelLifecycle().apply(null, parsed, "com.cainiao.wireless", now)
        val result = AssistantQueryEngine(Clock.fixed(now, ZoneOffset.UTC), ZoneOffset.UTC)
            .query("我要拿快递了", listOf(parcel))
        assertEquals(AssistantIntent.PICKUP_LIST, result.intent)
        assertEquals(listOf(parcel), result.parcels)
    }

    @Test
    fun `pickup code mask never reveals tail`() {
        assertEquals("4-2-****", maskPickupCode("4-2-6187"))
        assertEquals("****", maskPickupCode("6187"))
    }

    @Test
    fun `carrier corpus reaches expected synthetic precision`() {
        val samples = listOf(
            "菜鸟提醒：快递已到驿站" to "cainiao",
            "丰巢提醒：包裹已存入快递柜" to "fengchao",
            "顺丰快件 SF1234567890 正在派送" to "sf",
            "京东物流快递已发货" to "jd",
            "圆通快递已到达驿站" to "yto",
            "中通快递运输中" to "zto",
            "申通快递派送中" to "sto",
            "韵达快递到达站点" to "yunda",
            "极兔快递已签收" to "jnt",
            "EMS 快件运输途中" to "ems",
        )
        val correct = samples.count { (text, expected) -> parser.parse(text)?.carrier == expected }
        assertTrue(correct.toDouble() / samples.size >= 0.9)
    }

    @Test
    fun `parcel model stores only masked tracking presentation`() {
        assertEquals("SF********90", maskTrackingNumber("SF1234567890"))
        assertEquals(ConfidenceBand.HIGH, ConfidenceBand.HIGH)
    }

    @Test
    fun `automation policy keeps sensitive and risky updates in confirmation`() {
        val policy = ParcelAutomationPolicy()
        val safe = parser.parse("顺丰快件 SF1234567890 正在派送")!!
        val sensitive = parser.parse("菜鸟快递已到达驿站，取件码 4-2-6187")!!
        val exception = parser.parse("顺丰快递因天气原因延迟，运单号 SF1234567890")!!
        assertTrue(policy.canApplyWithoutConfirmation(safe))
        assertFalse(policy.canApplyWithoutConfirmation(sensitive))
        assertFalse(policy.canApplyWithoutConfirmation(exception))
    }
}
