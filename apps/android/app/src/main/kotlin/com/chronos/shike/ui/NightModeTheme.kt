@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package com.chronos.shike.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

val WarmPrimary = Color(0xFFB8775C)
val WarmOnPrimary = Color(0xFFFFFBF7)
val WarmPrimaryContainer = Color(0xFFF5DBC9)
val WarmOnPrimaryContainer = Color(0xFF3A1B0E)

val WarmSecondary = Color(0xFF9B8070)
val WarmOnSecondary = Color(0xFFFFFBF7)
val WarmSecondaryContainer = Color(0xFFEDE0D4)
val WarmOnSecondaryContainer = Color(0xFF332A22)

val WarmTertiary = Color(0xFF7A8B6F)
val WarmOnTertiary = Color(0xFFFFFBF7)
val WarmTertiaryContainer = Color(0xFFDDE8D3)
val WarmOnTertiaryContainer = Color(0xFF1F2A1A)

val WarmSurface = Color(0xFFFAF6F0)
val WarmOnSurface = Color(0xFF3D352E)
val WarmSurfaceVariant = Color(0xFFF0E8DD)
val WarmOnSurfaceVariant = Color(0xFF6B5D52)
val WarmBackground = Color(0xFFFAF6F0)
val WarmOnBackground = Color(0xFF3D352E)

val WarmError = Color(0xFF8B5C4A)
val WarmOnError = Color(0xFFFFFBF7)

val WarmOutline = Color(0xFFD4C9BC)
val WarmOutlineVariant = Color(0xFFE0D6C8)

val NightSurface = Color(0xFF2A2520)
val NightOnSurface = Color(0xFFC4B8AC)
val NightSurfaceVariant = Color(0xFF332E28)
val NightOnSurfaceVariant = Color(0xFF9A8E82)
val NightBackground = Color(0xFF221E1A)
val NightOnBackground = Color(0xFFC4B8AC)
val NightPrimary = Color(0xFF8B7560)
val NightOnPrimary = Color(0xFFE8DDD2)
val NightPrimaryContainer = Color(0xFF3D352E)
val NightOnPrimaryContainer = Color(0xFFD4C4B0)
val NightSecondaryContainer = Color(0xFF3D352E)
val NightOnSecondaryContainer = Color(0xFFB0A496)
val NightError = Color(0xFF8B5C4A)
val NightOnError = Color(0xFFE8DDD2)
val NightOutline = Color(0xFF4A4239)
val NightOutlineVariant = Color(0xFF3A332C)

private val WarmLightScheme = lightColorScheme(
    primary = WarmPrimary,
    onPrimary = WarmOnPrimary,
    primaryContainer = WarmPrimaryContainer,
    onPrimaryContainer = WarmOnPrimaryContainer,
    secondary = WarmSecondary,
    onSecondary = WarmOnSecondary,
    secondaryContainer = WarmSecondaryContainer,
    onSecondaryContainer = WarmOnSecondaryContainer,
    tertiary = WarmTertiary,
    onTertiary = WarmOnTertiary,
    tertiaryContainer = WarmTertiaryContainer,
    onTertiaryContainer = WarmOnTertiaryContainer,
    surface = WarmSurface,
    onSurface = WarmOnSurface,
    surfaceVariant = WarmSurfaceVariant,
    onSurfaceVariant = WarmOnSurfaceVariant,
    background = WarmBackground,
    onBackground = WarmOnBackground,
    error = WarmError,
    onError = WarmOnError,
    outline = WarmOutline,
    outlineVariant = WarmOutlineVariant,
)

private val WarmNightScheme = darkColorScheme(
    primary = NightPrimary,
    onPrimary = NightOnPrimary,
    primaryContainer = NightPrimaryContainer,
    onPrimaryContainer = NightOnPrimaryContainer,
    secondary = WarmSecondary,
    onSecondary = NightOnPrimary,
    secondaryContainer = NightSecondaryContainer,
    onSecondaryContainer = NightOnSecondaryContainer,
    tertiary = WarmTertiary,
    onTertiary = NightOnPrimary,
    surface = NightSurface,
    onSurface = NightOnSurface,
    surfaceVariant = NightSurfaceVariant,
    onSurfaceVariant = NightOnSurfaceVariant,
    background = NightBackground,
    onBackground = NightOnBackground,
    error = NightError,
    onError = NightOnError,
    outline = NightOutline,
    outlineVariant = NightOutlineVariant,
)

val LocalIsNightMode = staticCompositionLocalOf { false }

@Composable
fun OverloadTheme(
    isNightMode: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = if (isNightMode) WarmNightScheme else WarmLightScheme
    CompositionLocalProvider(LocalIsNightMode provides isNightMode) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = MaterialTheme.typography,
            content = content,
        )
    }
}

@Composable
fun OverloadCard(
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            content()
        }
    }
}

@Composable
fun SectionTitle(
    text: String,
    modifier: Modifier = Modifier,
) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.SemiBold,
        modifier = modifier,
    )
}

@Composable
fun HighlightCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            content()
        }
    }
}

@Composable
fun InfoLine(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = value,
            fontWeight = FontWeight.Medium,
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}
