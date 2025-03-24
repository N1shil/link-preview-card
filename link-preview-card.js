/**
 * Copyright 2025 N1shil
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `link-preview-card`
 * 
 * @element link-preview-card
 */
export class LinkPreviewCard extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "link-preview-card";
  }

  constructor() {
    super();
    this.title = "";
    this.webLink = "";
    this.description = "";
    this.imageLink = "";
    this.link = "";
    this.themeColor = "";
    this.loading = false;

    this.t = {
      title: "Title",
    };

    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/link-preview-card.ar.json", import.meta.url).href + "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      webLink: { type: String, attribute: "web-link" },
      description: { type: String },
      imageLink: { type: String, attribute: "image-link" },
      link: { type: String },
      themeColor: { type: String },
      loading: { type: Boolean },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          background-color: #fff;
          color: #222;
          font-family: Arial, sans-serif;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .link-search {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1rem;
        }

        input {
          padding: 0.5rem;
          flex: 1;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: none;
          background-color: #333;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
        }

        button:hover {
          background-color: #555;
        }

        img {
          max-width: 100%;
          border-radius: 8px;
          margin-top: 1rem;
        }

        h3 {
          margin-top: 1rem;
          font-size: 1.2rem;
        }

        .desc {
          font-size: 0.95rem;
          color: #444;
          margin-top: 0.5rem;
        }

        a {
          display: inline-block;
          margin-top: 1rem;
          text-decoration: none;
          color: #0077cc;
          font-weight: bold;
        }

        .loading-spinner {
          margin: 1rem auto;
          width: 30px;
          height: 30px;
          border: 4px solid #ddd;
          border-top: 4px solid #0077cc;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="link-search">
          <input id="input" placeholder="Enter full URL" @keydown="${this.handleInput}" />
          <button @click="${this.handleInput}">Search</button>
        </div>

        ${this.loading
          ? html`<div class="loading-spinner"></div>`
          : html`
              ${this.imageLink
                ? html`<img src="${this.imageLink}" alt="${this.t.title}: ${this.title}" />`
                : ""}
              <h3>${this.title}</h3>
              <p class="desc">${this.description}</p>
              ${this.link
                ? html`<a href="${this.link}" target="_blank">Visit Site</a>`
                : ""}
            `}
        <slot></slot>
      </div>
    `;
  }

  handleInput(e) {
    const value = this.shadowRoot.querySelector("#input").value.trim();
    if ((e.type === "click" || e.key === "Enter") && !value.startsWith("https://")) {
      alert("Please enter a valid URL starting with https://");
      return;
    }
    if (e.type === "click" || e.key === "Enter") {
      this.webLink = value;
      this.loading = true;
    }
  }

  updated(changedProps) {
    if (changedProps.has("webLink")) {
      this.fetchMetadata(this.webLink);
    }
  }

  // Fetch metadata 
  async fetchMetadata(link) {
    const api = `https://open-apis.hax.cloud/api/services/website/metadata?q=${link}`;
    try {
      const response = await fetch(api);
      const json = await response.json();
      const data = json.data || {};

      this.title = data["og:title"] || data["title"] || "No Title Found";
      this.description = this.description || data["og:description"] || data["description"] || "No Description Available";
      this.imageLink = data["og:image"] || data["image"] || (data["ld+json"]?.logo ?? "");
      this.link = data["url"] || link;
      this.themeColor = data["theme-color"] || "#333";
    } catch (err) {
      console.error("Error fetching preview:", err);
      this.title = "Could not load preview";
      this.description = "";
      this.imageLink = "";
      this.link = "";
    } finally {
      this.loading = false;
    }
  }

  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href;
  }
}

globalThis.customElements.define(LinkPreviewCard.tag, LinkPreviewCard);
