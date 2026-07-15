package com.chronos.shike.safety

import com.chronos.shike.wellbeing.BodyTag
import java.time.Instant
import java.util.UUID

enum class SafetyRoute { ORDINARY_OVERLOAD, PHYSICAL_DISCOMFORT, DISTRESS_SUPPORT, IMMEDIATE_SAFETY }

data class SafetySignal(
    val id: String,
    val source: String = "user_reported",
    val category: String,
    val severityBand: String,
    val matchedEvidence: List<String>,
    val responseRoute: SafetyRoute,
    val createdAt: Instant,
)

data class SafetyResponse(val route: SafetyRoute, val message: String, val requiresClinicalAndLegalReview: Boolean = true, val uploadsData: Boolean = false)

class SafetyRouter {
    fun route(userText: String?, bodyTags: Set<BodyTag>, severeOrPersistent: Boolean = false): SafetyResponse {
        val normalized = userText.orEmpty().lowercase()
        val explicitImmediateDanger = listOf("伤害自己", "自杀", "伤害他人", "无法保证安全", "kill myself", "suicide").any(normalized::contains)
        val distress = listOf("撑不住", "绝望", "痛苦", "hopeless").any(normalized::contains)
        val physical = severeOrPersistent || bodyTags.any { it in setOf(BodyTag.CHEST_DISCOMFORT, BodyTag.BREATHING_DISCOMFORT, BodyTag.PALPITATIONS) }
        return when {
            explicitImmediateDanger -> SafetyResponse(SafetyRoute.IMMEDIATE_SAFETY, "请立即联系当地紧急服务或可信任的人，并前往安全、有人陪伴的环境。应用不能替代专业支持。")
            physical -> SafetyResponse(SafetyRoute.PHYSICAL_DISCOMFORT, "先暂停工作。身体不适持续、反复或严重时，请及时寻求医疗评估；紧急症状请联系当地紧急医疗服务。")
            distress -> SafetyResponse(SafetyRoute.DISTRESS_SUPPORT, "可以先减少眼前负荷，也可以联系可信任的人或专业支持。是否继续由你决定。")
            else -> SafetyResponse(SafetyRoute.ORDINARY_OVERLOAD, "继续查看可解释的负荷信息和可撤销的降载建议。")
        }
    }

    fun signal(userText: String?, bodyTags: Set<BodyTag>, now: Instant): SafetySignal {
        val response = route(userText, bodyTags)
        return SafetySignal(UUID.randomUUID().toString(), category = response.route.name.lowercase(), severityBand = when (response.route) {
            SafetyRoute.ORDINARY_OVERLOAD -> "ordinary"
            SafetyRoute.DISTRESS_SUPPORT -> "elevated"
            SafetyRoute.PHYSICAL_DISCOMFORT -> "physical"
            SafetyRoute.IMMEDIATE_SAFETY -> "immediate"
        }, matchedEvidence = bodyTags.map { it.name.lowercase() }, responseRoute = response.route, createdAt = now)
    }
}
