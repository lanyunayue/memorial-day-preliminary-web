pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "chronos-shike"

include(":apps:android:app")
include(":packages:event-contract")
include(":packages:parcel-domain")
include(":packages:temporal-contract")
