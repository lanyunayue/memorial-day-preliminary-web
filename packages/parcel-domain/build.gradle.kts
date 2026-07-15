plugins {
    id("org.jetbrains.kotlin.jvm")
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(project(":packages:event-contract"))
    implementation(project(":packages:temporal-contract"))
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
