//Responsible for interfacing with the GPIO pins, which control the request trigger and the volume

import Main, { BaseManager } from "..";
import {Gpio} from "onoff";
import loudness from "loudness";

export default class GPIOInterface extends BaseManager {
    private currentVolume: number = 50;
    constructor(Main: Main) {
        super(Main);
    }
    startListeners() {
        loudness.getVolume().then((volumeLevel) => this.currentVolume = volumeLevel).catch(() => {/* */});
        console.log("[Interval] Starting GPIO Interval");
        this.watchButton();
    }

    private watchButton() {
        const requestButton = new Gpio(this.Main.config.gpioRequestPin, "in", "rising", {debounceTimeout: 100});

        requestButton.watch(() => {
            console.log("Button Pressed. Launching Request!");

            this.Main.RuntimeManager.makeRequest();
            return;
        });

        const vUpButton = new Gpio(this.Main.config.gpioVolumeUpPin, "in", "rising", {debounceTimeout: 100});

        vUpButton.watch(() => {
            console.log("Volume Up");

            this.currentVolume = this.currentVolume + 10;
            if (this.currentVolume > 100) this.currentVolume = 100;

            loudness.setVolume(this.currentVolume).catch(() => {/* */})
            return;
        });

        const vDownButton = new Gpio(this.Main.config.gpioVolumeDownPin, "in", "rising", {debounceTimeout: 100});

        vDownButton.watch(() => {
            console.log("Volume Down");

            this.currentVolume = this.currentVolume - 10;
            if (this.currentVolume < 0) this.currentVolume = 0;

            loudness.setVolume(this.currentVolume).catch(() => {/* */})
            return;
        });
    }
}