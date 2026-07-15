package com.chronos.shike.ui

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertTrue
import org.junit.Test

class NightModeThemeContrastTest {
    @Test
    fun keyTextAndContainerPairsMeetWcagAa() {
        val pairs: List<Pair<Color, Color>> = listOf(
            // Warm (day) theme colors
            WarmOnPrimary to WarmPrimary,
            WarmOnPrimaryContainer to WarmPrimaryContainer,
            WarmOnSecondary to WarmSecondary,
            WarmOnSecondaryContainer to WarmSecondaryContainer,
            WarmOnTertiary to WarmTertiary,
            WarmOnTertiaryContainer to WarmTertiaryContainer,
            WarmOnSurface to WarmSurface,
            WarmOnSurfaceVariant to WarmSurfaceVariant,
            // Night theme colors (only colors that exist in NightModeTheme.kt)
            NightOnPrimary to NightPrimary,
            NightOnPrimaryContainer to NightPrimaryContainer,
            NightOnSecondaryContainer to NightSecondaryContainer,
            NightOnSurface to NightSurface,
            NightOnSurfaceVariant to NightSurfaceVariant,
        )

        pairs.forEach { (foreground, background) ->
            val ratio = contrastRatio(foreground, background)
            assertTrue("Expected WCAG AA contrast (>= 4.5), found ratio=$ratio", ratio >= 4.5)
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
