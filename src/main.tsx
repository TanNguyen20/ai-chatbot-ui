import ReactDOM from 'react-dom/client';
import "./index.css"
import AiChat from './index';

class AiChatElement extends HTMLElement {
  root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const sourceHost = import.meta.env.MODE === "development" ? "http://localhost:5173" : import.meta.env.VITE_SOURCE_HOST;

    // Inject Tailwind CSS into Shadow DOM
    const res = await fetch(sourceHost + '/ai-chat-ui.css');
    const css = await res.text();
    
    const style:any = document.createElement('style');
    
    style.textContent = css;
    this.root.appendChild(style);

    // Now render the React component
    const api_key = this.getAttribute('api_key') || '';
    const container = document.createElement('div');
    this.root.appendChild(container);
    ReactDOM.createRoot(container).render(<AiChat apiKey={api_key} />);
  }
}

customElements.define('ai-chat', AiChatElement);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<AiChat apiKey={import.meta.env.VITE_API_KEY} />);
