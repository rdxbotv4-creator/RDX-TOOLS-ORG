<?php
// Session management
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Get current page name for active navigation
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle : 'SARDAR RDX TOOLS'; ?> | Professional Multi-Tool Hub</title>
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <style>
        /* Tool-specific overrides */
        .tool-page .hero-section {
            min-height: 50vh;
            padding-top: 100px;
        }
        .tool-page .hero-title {
            font-size: 3rem;
        }
    </style>
</head>
<body class="tool-page">
    <!-- Particle Background -->
    <div id="particles-js"></div>

    <!-- Navigation -->
    <nav class="main-nav" id="mainNav">
        <div class="nav-container">
            <a href="../index.html" class="nav-brand">
                <span class="brand-text">
                    <span class="brand-sardar">SARDAR</span>
                    <span class="brand-rdx">RDX</span>
                </span>
                <span class="brand-subtitle">TOOLS</span>
            </a>
            <div class="nav-menu" id="navMenu">
                <a href="../index.html" class="nav-link <?php echo $currentPage == 'index' ? 'active' : ''; ?>">
                    <i class="fas fa-home"></i> Home
                </a>
                <a href="../index.html#tools" class="nav-link">
                    <i class="fas fa-tools"></i> Tools
                </a>
                <a href="../index.html#about" class="nav-link">
                    <i class="fas fa-info-circle"></i> About
                </a>
                <a href="../index.html#contact" class="nav-link">
                    <i class="fas fa-envelope"></i> Contact
                </a>
            </div>
            <div class="nav-toggle" id="navToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Tool Header -->
    <header class="hero-section">
        <div class="hero-content">
            <div class="hero-badge">
                <span class="badge-dot"></span>
                <span><?php echo isset($toolCategory) ? $toolCategory : 'RDX Tool'; ?></span>
            </div>
            <h1 class="hero-title">
                <span class="title-line accent"><?php echo isset($toolName) ? $toolName : 'RDX Tool'; ?></span>
            </h1>
            <p class="hero-description">
                <?php echo isset($toolDescription) ? $toolDescription : 'Advanced tool for automation and management.'; ?>
            </p>
            <div class="hero-actions">
                <a href="#tool-interface" class="btn btn-primary glow-btn">
                    <i class="fas fa-rocket"></i>
                    <span>Start Working</span>
                </a>
                <a href="../index.html#tools" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back to Tools</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Scroll to Top Button -->
    <button class="scroll-top" id="scrollTop">
        <i class="fas fa-arrow-up"></i>
    </button>
