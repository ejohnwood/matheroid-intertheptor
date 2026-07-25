# 🚀 Matheroid Interceptor ("Matheroid Intertheptor")

> **A high-octane, NASA-Cyberpunk arcade game designed to build rapid mental math fluency.**

![Matheroid Interceptor Theme](https://img.shields.io/badge/Aesthetic-NASA%20Cyberpunk-00ffcc?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-ff0066?style=for-the-badge)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Standalone)-ff9900?style=for-the-badge)

---

## 📖 Overview

**Matheroid Interceptor** (publicly hosted as **Matheroid Intertheptor**) combines classic 80s space arcade thrillers with modern web aesthetics and tuned pedagogical design. 

Math questions fall from deep space as menacing polygon asteroids towards your planetary defense ship. Type the correct answer on your keyboard or number pad to lock on with high-powered neon lasers and destroy the incoming threats before they breach your ship's energy shields.

---

## ✨ Key Features

### 🎛️ Mission Configuration Menu
Before launching into orbit, players can customize their gameplay experience:
* **Operations**: Practice Addition (`+`), Subtraction (`-`), Multiplication (`×`), Division (`÷`), or `ALL` (Mixed operations).
* **Difficulty Levels (Tuned for Mental Math)**:
  * **EASY**: Single-digit addition & subtraction facts (0–12), 0–5 multiplication tables, divisors 1–5.
  * **MEDIUM**: Sums/minuends 12–50, 0–10 multiplication tables, divisors 1–12.
  * **HARD**: Double-digit mental math (sums/differences 20–100), 2–12 multiplication tables, quotients 5–20. *No tedious 3-digit pen-and-paper math!*
* **Engine Speeds**:
  * 🌱 **ECO (Training Mode)**: 12-second fall time, 4-second spawn rate. Ideal for beginners learning new math concepts.
  * 🚀 **CRUISE (Standard)**: 8-second fall time, 2.5-second spawn rate. Balanced arcade pace.
  * ⚡ **WARP (Challenge)**: 4-second fall time, 1.2-second spawn rate. Reflex training for math whizzes.

---

### 🎮 Arcade Mechanics & Power-ups

* 👹 **Boss Asteroids (Red Polygons)**
  * Spawns automatically every **5th** asteroid.
  * 1.5x larger, moves slower, and awards **3 Points** (versus 1 point for standard asteroids).
* 💣 **Golden Smart Bomb (Gold Polygons)**
  * Spawns every **10 Points** earned.
  * Destroying a Golden Asteroid triggers a screen-wide EMP burst, instantly clearing all asteroids on screen!
  * *Smart Conflict Handler*: If a Boss and Smart Bomb spawn at the same time, the Boss drops first, followed 800ms later by the Smart Bomb.
* ⚡ **Hyper-Drive Mode**
  * Reaching a **5-streak** activates Hyper-Drive!
  * Transforms your ship's thrusters to supercharged cyan beams, speeds up background starwarp, and awards **2x score multipliers**.
* 🧠 **Smart Input Matrix (Instant Error Rejection)**
  * If a player types a number that doesn't match the prefix of *any* active asteroid on screen, the HUD input box instantly shakes red and clears itself.
  * Eliminates the "staring at a wrong answer" friction, giving kids immediate tactile feedback to try again.

---

## 🎨 Visual & Aesthetic Design

* **NASA Cyberpunk Theme**: Neon green `#00ffcc` HUDs, crimson alert indicators, animated laser paths, visual screen shakes, and multi-layered CSS parallax starfields.
* **Readable Math Fonts**: Clean, high-legibility sans-serif typography (`Verdana`) on asteroids ensures numbers like `0`, `6`, and `8` are instantly readable under pressure.
* **Encouraging Feedback**: Replaced harsh "Mission Failed" screens with an encouraging **"SYSTEM OFFLINE"** summary highlighting total **Asteroids Intercepted**.

---

## 🚀 Quick Start / Local Setup

No build steps or Node package installations are required!

### Option 1: Standard Web App
Open `index.html` directly in any modern web browser:
```bash
# Simply double click index.html or open via local dev server
index.html
```

### Option 2: Portable Single-File Version
For easy distribution, email sharing, or classroom offline use:
Open `AsteroidInterceptor_Portable.html` — a completely self-contained single file with all HTML, CSS, and JS bundled inside.

---

## 📁 File Structure

```text
solar-einstein/
├── index.html                       # Main Game HTML Structure
├── style.css                        # Cyberpunk CSS Design System & Keyframe Animations
├── script.js                        # Game Engine, State Machine & Math Generator
├── AsteroidInterceptor_Portable.html # All-in-one Single File Standalone Build
└── README.md                        # Project Documentation
```

---

## 🕹️ Controls

* **Keyboard / Numpad**: Type the numerical answer to lock on and fire.
* **Auto-Clear**: Type incorrect numbers to trigger instant auto-clear feedback.
* **Focus Retention**: Input field automatically maintains focus so gameplay is never interrupted by accidental clicks.

---

## 📄 License

MIT License. Free for educational and personal use!
