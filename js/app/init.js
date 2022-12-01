/*
Creator: Artur Brytkowski
https://www.fiverr.com/arturbrytkowski
*/

import App from './App.js';

const wave_count_x = 4.5;
const wave_count_y = 1.25;
const wave_speed_x = 1;
const wave_speed_y = 0.25;
const wave_power = 0.0425;

const app_container = document.body;
app_container.innerHTML = '';
const app = new App(wave_count_x, wave_count_x, wave_speed_x, wave_speed_y, wave_power);
app.render(app_container);
