# Design System & Technical Architecture

## 1. Project Overview
* **Project Name**:https://animamotors.github.io/
* **Design Generator**: Google Stitch
* **Hosting Platform**: GitHub Pages
* **Repository**:https://github.com/animamotors/animamotors.github.io

---

## 2. UI/UX & Visual Design
* **Design Philosophy**: Clean, modern, hooking web interface and responsive layout generated via Google Stitch prompts.
* **Color Palette**:
  * Primary: white
  * Secondary: black
  * Accent / CTA: grey
  * Background: white
* **Typography**:
  * Headings: [e.g., Inter / Sans-Serif]
  * Body: [e.g., Roboto / System Fonts]
* **Component Breakdown**:
  * **Header / Navigation**: Sticky navigation bar with responsive mobile menu.
  * **Hero Section**: Key value proposition and primary Call-to-Action (CTA).
  * **Content / Feature Grid**: Modular layout highlighting key offerings.
  * **Footer**: Quick links, social links, and copyright info.

---

## 3. Technical Architecture & Tech Stack
* **Frontend**: HTML5, CSS3 / Tailwind CSS, JavaScript (ES6+).
* **Asset Pipeline**: Static files exported from Google Stitch.
* **Hosting & Deployment**: Continuous deployment configured via GitHub Pages on the `main` branch.

---

## 4. Maintenance & Collaboration Guidelines
* **Code Exports**: Any major UI updates generated in Google Stitch should replace existing static assets in `/root`.
* **Branch Strategy**:
  * `main`: Production-ready code automatically published to GitHub Pages.
  * `feature/*`: Feature branches for collaborator edits prior to merging via Pull Request (PR).
* **Collaborators**: External contributors can request access via GitHub repository settings.
