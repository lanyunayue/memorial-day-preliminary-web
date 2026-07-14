package com.chronos.shike

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class OnboardingUiTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Before
    fun resetOnboarding() {
        compose.activityRule.scenario.onActivity {
            (it.application as ChronosApplication).container.preferences.onboardingComplete = false
        }
        compose.activityRule.scenario.recreate()
    }

    @Test
    fun onboardingExplainsPrivacyAndEntersNativeHome() {
        compose.onNodeWithText("先说明隐私边界").assertIsDisplayed()
        compose.onNodeWithText("发现后让我确认").assertIsDisplayed().performClick()
        compose.onNodeWithText("进入时刻").performClick()
        compose.onNodeWithText("我要拿快递了").assertIsDisplayed()
    }
}
