plugins { id("org.jetbrains.kotlin.jvm") }
kotlin { jvmToolchain(21) }
dependencies {
    implementation(project(":packages:wellbeing-contract"))
    testImplementation(kotlin("test"))
}
tasks.test { useJUnitPlatform() }
