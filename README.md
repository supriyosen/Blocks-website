# 3D Cubes Portfolio Website

A modern, interactive portfolio website featuring 3D cubes that react to cursor movement, built with Node.js and Three.js.

## Live Website

**Check out the live website here:** [https://supriyosen.github.io/Blocks-website/](https://supriyosen.github.io/Blocks-website/)

## Features

- Interactive 3D cubes that rotate based on cursor movement
- Wireframe cube design with brand logos
- Responsive design
- Black and white minimalist aesthetic
- Modern navigation bar
- Dark/Light mode toggle
- Instagram link integration

## Technologies Used

- Node.js
- Express.js
- Three.js for 3D graphics
- HTML5
- CSS3
- JavaScript

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/supriyosen/Blocks-website.git
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `server.js` - Express server setup
- `public/` - Static files
  - `index.html` - Main HTML file
  - `css/style.css` - Styling
  - `js/` - JavaScript files
    - `three.min.js` - Three.js library
    - `main.js` - Main application code

## Customization

You can customize the cubes by modifying the `cubeData` array in `public/js/main.js`. Each cube has an ID and a logo text.

## License

MIT 