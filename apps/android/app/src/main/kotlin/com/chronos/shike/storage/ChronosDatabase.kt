package com.chronos.shike.storage

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [ParcelEntity::class, ParcelEventEntity::class, ParcelDraftEntity::class, OperationEntity::class],
    version = 1,
    exportSchema = true,
)
abstract class ChronosDatabase : RoomDatabase() {
    abstract fun parcelDao(): ParcelDao
    abstract fun draftDao(): ParcelDraftDao
    abstract fun operationDao(): OperationDao

    companion object {
        fun create(context: Context): ChronosDatabase = Room.databaseBuilder(
            context.applicationContext,
            ChronosDatabase::class.java,
            "chronos-parcel.db",
        ).fallbackToDestructiveMigrationOnDowngrade().build()
    }
}
