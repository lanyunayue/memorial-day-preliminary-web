package com.chronos.shike.safety

import com.chronos.shike.wellbeing.BodyTag
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SafetyRouterTest {
    private val router = SafetyRouter()
    private val now = Instant.parse("2026-07-15T10:00:00Z")

    @Test
    fun `level A ordinary overload routes to ordinary overload`() {
        val response = router.route(
            userText = "今天事情比较多，有点忙不过来",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.ORDINARY_OVERLOAD, response.route)
        assertTrue(response.message.contains("负荷"), "普通过载应继续负荷建议")
        assertFalse(response.uploadsData, "不应自动上传数据")
    }

    @Test
    fun `level B physical discomfort stops efficiency and prompts medical evaluation`() {
        val response = router.route(
            userText = null,
            bodyTags = setOf(BodyTag.CHEST_DISCOMFORT),
        )
        assertEquals(SafetyRoute.PHYSICAL_DISCOMFORT, response.route)
        assertTrue(response.message.contains("暂停"), "身体不适应建议暂停")
        assertTrue(response.message.contains("医疗评估"), "应提示医疗评估")
        assertFalse(response.uploadsData, "不应自动上传数据")
    }

    @Test
    fun `level B breathing discomfort routes to physical discomfort`() {
        val response = router.route(
            userText = null,
            bodyTags = setOf(BodyTag.BREATHING_DISCOMFORT),
        )
        assertEquals(SafetyRoute.PHYSICAL_DISCOMFORT, response.route)
        assertTrue(response.message.contains("医疗评估"), "应提示医疗评估")
    }

    @Test
    fun `level B palpitations route to physical discomfort`() {
        val response = router.route(
            userText = null,
            bodyTags = setOf(BodyTag.PALPITATIONS),
        )
        assertEquals(SafetyRoute.PHYSICAL_DISCOMFORT, response.route)
    }

    @Test
    fun `level B severe or persistent flag routes to physical discomfort`() {
        val response = router.route(
            userText = "一直头疼",
            bodyTags = setOf(BodyTag.HEADACHE),
            severeOrPersistent = true,
        )
        assertEquals(SafetyRoute.PHYSICAL_DISCOMFORT, response.route)
    }

    @Test
    fun `level C distress provides quiet companionship and professional support entry`() {
        val response = router.route(
            userText = "真的撑不住了，太痛苦了",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.DISTRESS_SUPPORT, response.route)
        assertTrue(
            response.message.contains("可信任的人") || response.message.contains("专业支持"),
            "明显痛苦应提供可信任的人或专业支持入口",
        )
        assertFalse(response.uploadsData, "不应自动上传数据")
    }

    @Test
    fun `level C hopelessness expression routes to distress support`() {
        val response = router.route(
            userText = "感到绝望",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.DISTRESS_SUPPORT, response.route)
    }

    @Test
    fun `level D self harm expression highlights emergency services`() {
        val response = router.route(
            userText = "我想伤害自己",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route)
        assertTrue(response.message.contains("紧急服务"), "自伤表达应突出紧急服务")
        assertTrue(response.message.contains("安全"), "应提及安全环境")
        assertFalse(response.uploadsData, "不应自动上传数据")
    }

    @Test
    fun `level D suicide expression routes to immediate safety`() {
        val response = router.route(
            userText = "有自杀的念头",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route)
        assertTrue(response.message.contains("紧急服务"), "应突出紧急服务")
    }

    @Test
    fun `level D english suicide expression routes to immediate safety`() {
        val response = router.route(
            userText = "I want to kill myself",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route)
    }

    @Test
    fun `level D harming others expression routes to immediate safety`() {
        val response = router.route(
            userText = "我想伤害他人",
            bodyTags = emptySet(),
        )
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route)
    }

    @Test
    fun `does not auto upload data for any route`() {
        val allRoutes = listOf(
            router.route("今天很忙", emptySet()),
            router.route(null, setOf(BodyTag.CHEST_DISCOMFORT)),
            router.route("撑不住了", emptySet()),
            router.route("自杀", emptySet()),
        )
        allRoutes.forEach { response ->
            assertFalse(response.uploadsData, "任何路由都不应自动上传数据: ${response.route}")
        }
    }

    @Test
    fun `does not silently notify anyone - response is user facing only`() {
        val response = router.route("我想伤害自己", emptySet())
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route)
        assertTrue(
            response is SafetyResponse,
            "响应类型应为用户可见的 SafetyResponse",
        )
        assertFalse(response.uploadsData, "不静默上传")
        assertTrue(response.requiresClinicalAndLegalReview, "需要临床和法律审查")
        // 不通过手写字段列表检查"不存在某个字段"——这属于假证明。
        // 真实的安全保障来自：
        //   1. 行为测试：所有路由执行后 uploadsData == false（见 does not auto upload data for any route）
        //   2. 架构扫描：SafetyRouter 仅依赖 BodyTag / Instant / UUID，不导入网络、联系人、短信、通知或后台服务 API
        //   3. SafetyResponse 仅有 4 个字段：route, message, requiresClinicalAndLegalReview, uploadsData
        //      若新增字段涉及自动联系他人，需在代码审查中拦截，而非依赖运行时测试。
    }

    @Test
    fun `does not replace professional support with app`() {
        val immediateResponse = router.route("自杀", emptySet())
        assertTrue(
            immediateResponse.message.contains("应用不能替代专业支持"),
            "紧急安全响应应明确说明应用不能替代专业支持",
        )
        val physicalResponse = router.route(null, setOf(BodyTag.CHEST_DISCOMFORT))
        assertTrue(
            physicalResponse.message.contains("医疗评估") || physicalResponse.message.contains("紧急医疗服务"),
            "身体不适响应应引导寻求专业医疗",
        )
        val distressResponse = router.route("绝望", emptySet())
        assertTrue(
            distressResponse.message.contains("可信任的人") || distressResponse.message.contains("专业支持"),
            "痛苦响应应提供专业支持入口而非替代",
        )
    }

    @Test
    fun `signal creation produces correct metadata`() {
        val signal = router.signal(
            userText = "撑不住了",
            bodyTags = setOf(BodyTag.TIRED),
            now = now,
        )
        assertEquals(SafetyRoute.DISTRESS_SUPPORT, signal.responseRoute)
        assertEquals("elevated", signal.severityBand)
        assertEquals(now, signal.createdAt)
        assertTrue(signal.matchedEvidence.contains("tired"))
        assertEquals("user_reported", signal.source)
    }

    @Test
    fun `physical discomfort takes priority over distress`() {
        val response = router.route(
            userText = "撑不住了",
            bodyTags = setOf(BodyTag.BREATHING_DISCOMFORT),
        )
        assertEquals(SafetyRoute.PHYSICAL_DISCOMFORT, response.route, "身体不适应优先于情绪痛苦")
    }

    @Test
    fun `immediate danger takes priority over all other routes`() {
        val response = router.route(
            userText = "自杀",
            bodyTags = setOf(BodyTag.CHEST_DISCOMFORT),
        )
        assertEquals(SafetyRoute.IMMEDIATE_SAFETY, response.route, "自伤表达应最高优先级")
    }

    @Test
    fun `null user text with no body tags routes to ordinary overload`() {
        val response = router.route(null, emptySet())
        assertEquals(SafetyRoute.ORDINARY_OVERLOAD, response.route)
    }
}
