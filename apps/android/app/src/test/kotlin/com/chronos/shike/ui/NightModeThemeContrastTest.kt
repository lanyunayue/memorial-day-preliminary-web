package com.chronos.shike.ui

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertTrue
import org.junit.Test

class NightModeThemeContrastTest {
    @Test
    fun textContainerPairsMeetWcagAaNormalText() {
        // These pairs are used for body/label text rendered on containers or surfaces,
        // so they must meet WCAG 2.1 AA for normal text (>= 4.5:1).
        val textPairs: List<Pair<Color, Color>> = listOf(
            // Warm (day) theme
            WarmOnPrimaryContainer to WarmPrimaryContainer,
            WarmOnSecondaryContainer to WarmSecondaryContainer,
            WarmOnTertiaryContainer to WarmTertiaryContainer,
            WarmOnSurface to WarmSurface,
            WarmOnSurfaceVariant to WarmSurfaceVariant,
            // Night theme
            NightOnPrimaryContainer to NightPrimaryContainer,
            NightOnSecondaryContainer to NightSecondaryContainer,
            NightOnSurface to NightSurface,
            NightOnSurfaceVariant to NightSurfaceVariant,
        )

        textPairs.forEach { (foreground, background) ->
            val ratio = contrastRatio(foreground, background)
            assertTrue(
                "Expected WCAG AA normal-text contrast (>= 4.5), found ratio=$ratio",
                ratio >= 4.5,
            )
        }
    }

    @Test
    fun buttonComponentPairsMeetWcagAaNonText() {
        // These pairs are used for UI components (buttons, FABs, chips, selected states)
        // which fall under WCAG 2.1 SC 1.4.11 Non-text Contrast (>= 3:1).
        val componentPairs: List<Pair<Color, Color>> = listOf(
            WarmOnPrimary to WarmPrimary,
            WarmOnSecondary to WarmSecondary,
            WarmOnTertiary to WarmTertiary,
            NightOnPrimary to NightPrimary,
        )

        componentPairs.forEach { (foreground, background) ->
            val ratio = contrastRatio(foreground, background)
            assertTrue(
                "Expected WCAG AA non-text UI contrast (>= 3.0), found ratio=$ratio",
                ratio >= 3.0,
            )
        }
    }

    private fun contrastRatio(foreground: Color, background: Color): Double {
        val lighter = maxOf(relativeLuminance(foreground), relativeLuminance(background))
        val darker = minOf(relativeLuminance(foreground), relativeLuminance(background))
        return (lighter + 0.05) / (darker + 0.05)
    }

    private fun relativeLuminance(color: Color): Double {
        fun channel(value: Float): Double {
            val component = value.toDouble()
            return if (component <= 0.04045) component / 12.92
            else Math.pow((component + 0.055) / 1.055, 2.4)
        }

        return 0.2126 * channel(color.red) +
            0.7152 * channel(color.green) +
            0.0722 * channel(color.blue)
    }
}
