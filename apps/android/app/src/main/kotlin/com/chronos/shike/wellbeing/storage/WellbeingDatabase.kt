package com.chronos.shike.wellbeing.storage

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.chronos.shike.BuildConfig

@Database(
    entities = [
        DailyCheckInEntity::class,
        SleepLogEntity::class,
        LoadItemEntity::class,
        LoadSnapshotEntity::class,
        WellbeingOperationEntity::class,
        SuggestionFeedbackEntity::class,
        DeLoadPlanEntity::class,
        InterventionPreferenceEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
abstract class WellbeingDatabase : RoomDatabase() {
    abstract fun dailyCheckInDao(): DailyCheckInDao
    abstract fun sleepLogDao(): SleepLogDao
    abstract fun loadItemDao(): LoadItemDao
    abstract fun loadSnapshotDao(): LoadSnapshotDao
    abstract fun wellbeingOperationDao(): WellbeingOperationDao
    abstract fun suggestionFeedbackDao(): SuggestionFeedbackDao
    abstract fun deLoadPlanDao(): DeLoadPlanDao
    abstract fun interventionPreferenceDao(): InterventionPreferenceDao

    companion object {
        fun create(context: Context): WellbeingDatabase = Room.databaseBuilder(
            context.applicationContext,
            WellbeingDatabase::class.java,
            "chronos-wellbeing.db",
        )
            .fallbackToDestructiveMigration()
            .fallbackToDestructiveMigrationOnDowngrade()
            .apply {
                if (BuildConfig.DEBUG) {
                    allowMainThreadQueries()
                }
            }
            .build()
    }
}
