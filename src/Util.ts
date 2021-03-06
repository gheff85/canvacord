import moment from "moment";
import abbrev from "../plugins/abbrev";
import renderEmoji from "../plugins/renderEmoji";
import momentDurationFormatSetup from "moment-duration-format";
import { CanvasRenderingContext2D } from "canvas";

export interface UtilGetLines {
    text: string,
    ctx: CanvasRenderingContext2D,
    maxWidth: number
};

momentDurationFormatSetup(moment);

class Util {

    /**
     * Canvacord Util
     * @hideconstructor
     */
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Validates hex
     * @param {string} hex Hex code to validate
     * @returns {boolean}
     */
    static validateHex(hex: string): boolean {
        if (!hex || typeof hex !== "string") return false;
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Converts regular timestamp to discord like time
     * @param {Date|number} time Timestamp to convert
     * @returns {string}
     */
    static discordTime(time?: Date | number): string {
        if (!time) time = new Date();
        let date = time && time  instanceof Date ? time : new Date(time);
        let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        return `Today at ${hours}:${minutes}`;
    }

    /**
     * Formats time
     * @param {number} time Time to format
     * @returns {string}
     */
    static formatTime(time: number): string {
        if (!time) return "00:00";
        // @TOOD: Fix this type
        // @ts-expect-error
        const fmt = moment.duration(time).format("dd:hh:mm:ss");

        const chunk = fmt.split(":");
        if (chunk.length < 2) chunk.unshift("00");
        return chunk.join(":");
    }

    /**
     * Shorten text.
     * @param {string} text Text to shorten 
     * @param {number} len Max Length
     * @returns {string}
     */
    static shorten(text: string, len: number): string {
        if (typeof text !== "string") return "";
        if (text.length <= len) return text;
        return text.substr(0, len).trim() + "...";
    }

    /**
     * Converts numbers into units like `1K`, `1M`, `1B` etc.
     * @param {number|string} num
     * @returns {string} 
     */
    static toAbbrev(num: number | string): string {
        return abbrev(num);
    }

    /**
     * Renders text with emoji
     * @param {CanvasRenderingContext2D} ctx CanvasRenderingContext2D
     * @param {string} msg Message
     * @param {number} x X
     * @param {number} y Y
     * @returns {Promise<void>}
     */
    static renderEmoji(ctx: CanvasRenderingContext2D, msg: string, x: number, y: number): Promise<void> {
        return renderEmoji(ctx, msg, x, y);
    }

    /**
     * Returns formatted hex code
     * @param {string} hex Hex code to format
     * @param {string} alt Alt color
     * @returns {string}
     */
    static formatHex(hex: string, alt?: string): string {
        if (!alt) alt = "#000000";
        if (!hex || typeof hex !== "string") return alt || "#000000";
        hex = hex.replace("#", "");
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6) return alt || "#000000";

        return `#${hex}`;
    }

    /**
     * Inverts hex color
     * @param {string} hex Hex color code to invert
     * @returns {string}
     */
    static invertColor(hex: string): string {
        if (!hex || typeof hex !== "string") return "#FFFFFF";
        hex = hex.replace("#", "");

        // match hex color
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6) return "#FFFFFF";

        // invert colors
        const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
        const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
        const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

        // return new hex
        const pad = (txt: string, length = 2) => {
            let arr = [length].join("0");
            return (arr + txt).slice(-length);
        };

        const finalHex = `#${pad(r)}${pad(g)}${pad(b)}`;
        return finalHex;
    }

    /**
     * Returns acronym
     * @param {string} name Name to parse acronym
     * @returns {string}
     */
    static getAcronym(name: string): string {
        if (!name || typeof name !== "string") return "";
        return name
            .replace(/'s /g, " ")
            .replace(/\w+/g, e => e[0])
            .replace(/\s/g, "");
    }

    /**
     * Returns array of lines
     * @param {object} params Params
     * @param {string} text Text
     * @param {CanvasRenderingContext2D} ctx CanvasRenderingContext2D
     * @param {number} maxWidth Max width
     * @returns {string[]}
     */
    static getLines(options: UtilGetLines): string[] {
        let { text, ctx, maxWidth } = options;
        if (!text) return [];
        if (!ctx) throw new Error("Canvas context was not provided!");
        if (!maxWidth) throw new Error("No max-width provided!");
        const lines: string[] = [];

        while (text.length) {
            let i;
            for (i = text.length; ctx.measureText(text.substr(0, i)).width > maxWidth; i -= 1);
            const result = text.substr(0, i);
            let j;
            if (i !== text.length) for (j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);
            lines.push(result.substr(0, j || result.length));
            text = text.substr(lines[lines.length - 1].length, text.length);
        }

        return lines;
    }

}

export default Util;