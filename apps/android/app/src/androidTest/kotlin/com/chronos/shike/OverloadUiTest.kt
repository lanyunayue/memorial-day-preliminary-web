package com.chronos.shike

import android.app.Application
import android.content.Context
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.chronos.shike.load.LoadSourceType
import com.chronos.shike.load.Negotiability
import com.chronos.shike.load.ResponsibilityType
import com.chronos.shike.security.PickupCodeCrypto
import com.chronos.shike.storage.ChronosDatabase
import com.chronos.shike.storage.ParcelRepository
import com.chronos.shike.ui.OverloadApp
import com.chronos.shike.wellbeing.storage.WellbeingDatabase
import java.time.LocalTime
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class OverloadUiTest {
    @get:Rule val composeRule = createComposeRule()

    private lateinit var context: Context
    private lateinit var wellbeingDb: WellbeingDatabase
    private lateinit var chronosDb: ChronosDatabase
    private lateinit var preferences: ChronosPreferences
    private lateinit var viewModel: OverloadViewModel

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        wellbeingDb = Room.inMemoryDatabaseBuilder(
            context,
            WellbeingDatabase::class.java,
        ).allowMainThreadQueries().build()
        chronosDb = Room.inMemoryDatabaseBuilder(
            context,
            ChronosDatabase::class.java,
        ).allowMainThreadQueries().build()
        preferences = ChronosPreferences(context)
        preferences.onboardingComplete = false

        val container = AppContainer(
            repository = ParcelRepository(chronosDb, PickupCodeCrypto()),
            notificationSource = null,
            preferences = preferences,
        )
        viewModel = OverloadViewModel(
            application = context as Application,
            container = container,
        )
    }

    @After
    fun tearDown() {
        wellbeingDb.close()
        chronosDb.close()
    }

    private fun setOnboardingComplete() {
        preferences.onboardingComplete = true
        viewModel.completeOnboarding()
    }

    @Test
    fun firstLaunchShowsOnboarding() {
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("负荷与恢复助手").assertIsDisplayed()
        composeRule.onNodeWithText("开始使用").assertIsDisplayed()
    }

    @Test
    fun onboardingExplainsProductBoundaries() {
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("不诊断").assertIsDisplayed()
        composeRule.onNodeWithText("不说教").assertIsDisplayed()
        composeRule.onNodeWithText("不强迫").assertIsDisplayed()
        composeRule.onNodeWithText("不排名").assertIsDisplayed()
        composeRule.onNodeWithText("不让休息变成任务").assertIsDisplayed()
        composeRule.onNodeWithText("非临床声明").assertIsDisplayed()
    }

    @Test
    fun bottomNavigationFourTabsAreSwitchable() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("今天").assertIsDisplayed()
        composeRule.onNodeWithText("降载").assertIsDisplayed()
        composeRule.onNodeWithText("回顾").assertIsDisplayed()
        composeRule.onNodeWithText("我的").assertIsDisplayed()

        composeRule.onNodeWithText("降载").performClick()
        composeRule.onNodeWithText("降载").assertIsDisplayed()

        composeRule.onNodeWithText("回顾").performClick()
        composeRule.onNodeWithText("次日反馈").assertIsDisplayed()

        composeRule.onNodeWithText("我的").performClick()
        composeRule.onNodeWithText("提醒偏好").assertIsDisplayed()

        composeRule.onNodeWithText("今天").performClick()
        composeRule.onNodeWithText("十秒签到").assertIsDisplayed()
    }

    @Test
    fun todayPageShowsCheckInEntry() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("十秒签到").assertIsDisplayed()
        composeRule.onNodeWithText("去签到").assertIsDisplayed()
    }

    @Test
    fun checkInFlowCanBeCompleted() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("去签到").performClick()
        composeRule.onNodeWithText("十秒签到").assertIsDisplayed()
        composeRule.onNodeWithText("所有字段都可以跳过，只记录你想记录的。").assertIsDisplayed()

        composeRule.onNodeWithText("保存").performClick()

        composeRule.waitForIdle()
        assertEquals("签到后应有一条记录", 1, viewModel.uiState.value.checkIns.size)
        assertNotNull("今日签到应已设置", viewModel.uiState.value.todayCheckIn)
        composeRule.onNodeWithText("今天已签到").assertIsDisplayed()
        composeRule.onNodeWithText("更新签到").assertIsDisplayed()
    }

    @Test
    fun checkInCanBeSkippedWithoutCrash() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("去签到").performClick()
        composeRule.onNodeWithText("跳过签到").performClick()
        composeRule.waitForIdle()
        assertEquals("跳过签到不应创建记录", 0, viewModel.uiState.value.checkIns.size)
    }

    @Test
    fun deLoadPreviewCanBeDisplayed() {
        setOnboardingComplete()
        viewModel.addLoadItem(
            title = "测试降载任务一",
            sourceType = LoadSourceType.TASK,
            dueAt = null,
            estimatedEffortMinutes = 120,
            importance = 3,
            negotiability = Negotiability.FLEXIBLE,
            responsibilityType = ResponsibilityType.SELF_CHOSEN,
        )
        viewModel.addLoadItem(
            title = "测试降载任务二",
            sourceType = LoadSourceType.TASK,
            dueAt = null,
            estimatedEffortMinutes = 60,
            importance = 2,
            negotiability = Negotiability.DISCUSSABLE,
            responsibilityType = ResponsibilityType.SELF_CHOSEN,
        )
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("降载").performClick()
        composeRule.onNodeWithText("预览降载方案").assertIsDisplayed()
        composeRule.onNodeWithText("预览降载方案").performClick()
        composeRule.waitForIdle()
        assertNotNull("预览后应生成降载方案", viewModel.uiState.value.deLoadPlan)
        composeRule.onNodeWithText("今晚只留一件").assertIsDisplayed()
        composeRule.onNodeWithText("确认降载方案").assertIsDisplayed()
        composeRule.onNodeWithText("撤销预览").assertIsDisplayed()
    }

    @Test
    fun deLoadPlanConfirmAndUndo() {
        setOnboardingComplete()
        viewModel.addLoadItem(
            title = "可降载任务",
            sourceType = LoadSourceType.TASK,
            dueAt = null,
            estimatedEffortMinutes = 90,
            importance = 2,
            negotiability = Negotiability.FLEXIBLE,
            responsibilityType = ResponsibilityType.SELF_CHOSEN,
        )
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("降载").performClick()
        composeRule.onNodeWithText("预览降载方案").performClick()
        composeRule.waitForIdle()
        composeRule.onNodeWithText("确认降载方案").performClick()
        composeRule.waitForIdle()
        assertTrue(
            "确认后方案应为已确认状态",
            viewModel.uiState.value.deLoadPlan?.userConfirmed == true,
        )
        composeRule.onNodeWithText("撤销降载").assertIsDisplayed()
        composeRule.onNodeWithText("撤销降载").performClick()
        composeRule.waitForIdle()
        assertNull(
            "撤销后方案应被清除",
            viewModel.uiState.value.deLoadPlan,
        )
    }

    @Test
    fun nightModeToggleChangesUiState() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        viewModel.setNightModeTime(LocalTime.of(0, 0), LocalTime.of(23, 59))
        viewModel.setNightModeEnabled(true)
        composeRule.waitForIdle()
        assertTrue(
            "深夜关怀开关应已开启",
            viewModel.uiState.value.preference.nightModeEnabled,
        )
        assertTrue(
            "设置全覆盖时间窗口后应进入深夜模式",
            viewModel.uiState.value.isNightMode,
        )
        composeRule.onNodeWithText("现在已经很晚").assertIsDisplayed()
    }

    @Test
    fun nightModeCanBeDisabledFromBanner() {
        setOnboardingComplete()
        viewModel.setNightModeTime(LocalTime.of(0, 0), LocalTime.of(23, 59))
        viewModel.setNightModeEnabled(true)
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("现在已经很晚").assertIsDisplayed()
        composeRule.onNodeWithText("不再提醒").performClick()
        composeRule.waitForIdle()
        assertFalse(
            "点击不再提醒后深夜关怀应关闭",
            viewModel.uiState.value.preference.nightModeEnabled,
        )
    }

    @Test
    fun minePageShowsSafetyResourcesAndProductBoundaries() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("我的").performClick()
        composeRule.onNodeWithText("隐私中心").assertIsDisplayed()
        composeRule.onNodeWithText("安全资源").assertIsDisplayed()
        composeRule.onNodeWithText("关于产品边界").assertIsDisplayed()
        composeRule.onNodeWithText("删除全部数据").assertIsDisplayed()
    }

    @Test
    fun parcelConnectorSectionNotShownWhenDisabled() {
        setOnboardingComplete()
        composeRule.setContent {
            OverloadApp(viewModel = viewModel, onExport = {})
        }
        composeRule.onNodeWithText("我的").performClick()
        assertFalse(
            "UI 状态中快递连接器应未启用",
            viewModel.uiState.value.parcelConnectorEnabled,
        )
        assertEquals(
            "快递关闭时不应显示快递连接器区块",
            0,
            composeRule.onAllNodesWithText("快递连接器").fetchSemanticsNodes().size,
        )
    }
}
