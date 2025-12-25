// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PracticeFlux",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "PracticeFlux",
            targets: ["PracticeFlux"]
        ),
    ],
    dependencies: [
        // Networking
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),

        // Secure Storage
        .package(url: "https://github.com/evgenyneu/keychain-swift.git", from: "20.0.0"),

        // Image Loading
        .package(url: "https://github.com/kean/Nuke.git", from: "12.0.0"),

        // Dependency Injection
        .package(url: "https://github.com/hmlongco/Factory.git", from: "2.3.0"),
    ],
    targets: [
        .target(
            name: "PracticeFlux",
            dependencies: [
                "Alamofire",
                .product(name: "KeychainSwift", package: "keychain-swift"),
                "Nuke",
                .product(name: "NukeUI", package: "Nuke"),
                "Factory",
            ],
            path: "PracticeFlux"
        ),
        .testTarget(
            name: "PracticeFluxTests",
            dependencies: ["PracticeFlux"],
            path: "PracticeFluxTests"
        ),
    ]
)
