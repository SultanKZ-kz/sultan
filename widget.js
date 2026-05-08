// c:\Users\LENOVO\Downloads\33\widget.js

(function () {
  const WIDGET_CONFIG = {
    // ВНИМАНИЕ: Вставьте ваш API ключ Gemini сюда (получить можно на aistudio.google.com)
    apiKey: 'AIzaSyAVj_o3126LU8US8kKsy9l6FqZ1y0y9syE',
    model: 'gemma-4-31b-it', // Вы можете изменить на другую модель при необходимости (например, gemma-2-9b-it или gemini-1.5-flash)
    assistantName: 'Виртуальный помощник с Москитными сетками',
    systemInstruction: `Ты - профессиональный консультант и виртуальный помощник по москитным сеткам. Твоя цель - отвечать на вопросы касательно москитных сеток, помогать клиентам делать замеры окон для них, рассчитывать примерную стоимость, уточнять детали и выводить точный результат. Будь вежлив, задавай наводящие вопросы для точных расчетов. Приветствуй клиента и предлагай помощь с замерами или выбором сетки. Отвечай кратко, емко и по делу на русском языке.`
  };

  let chatHistory = [];
  let isOpen = false;

  function initWidget() {
    const root = document.createElement('div');
    root.id = 'mosquito-widget-root';

    root.innerHTML = `
      <div id="mosquito-widget-window">
        <div id="mosquito-widget-header">
          <div>
            <div class="title">${WIDGET_CONFIG.assistantName}</div>
            <div class="subtitle">Online | Модель: ${WIDGET_CONFIG.model}</div>
          </div>
          <button id="mosquito-widget-close">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div id="mosquito-widget-messages"></div>
        <div id="mosquito-widget-input-area">
          <input type="text" id="mosquito-widget-input" placeholder="Введите сообщение..." autocomplete="off">
          <button id="mosquito-widget-send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
      </div>
      <div id="mosquito-widget-button">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
      </div>
    `;

    document.body.appendChild(root);

    const btn = document.getElementById('mosquito-widget-button');
    const win = document.getElementById('mosquito-widget-window');
    const closeBtn = document.getElementById('mosquito-widget-close');
    const sendBtn = document.getElementById('mosquito-widget-send');
    const input = document.getElementById('mosquito-widget-input');

    btn.addEventListener('click', () => toggleWidget(win));
    closeBtn.addEventListener('click', () => toggleWidget(win));

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Начальное приветствие
    addMessage('Здравствуйте! Я виртуальный помощник. Отвечу на любые вопросы по москитным сеткам, помогу с замерами и расчетами. Чем могу помочь?', 'assistant');
  }

  function toggleWidget(win) {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.add('open');
      document.getElementById('mosquito-widget-input').focus();
    } else {
      win.classList.remove('open');
    }
  }

  function addMessage(text, role) {
    const messagesContainer = document.getElementById('mosquito-widget-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `mw-msg ${role}`;

    // Простой парсинг Markdown (жирный текст и переносы строк)
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br>');

    msgDiv.innerHTML = formattedText;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showLoading() {
    const messagesContainer = document.getElementById('mosquito-widget-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'mw-msg loading';
    loadingDiv.id = 'mw-loading';
    loadingDiv.innerHTML = '<div class="mw-dot"></div><div class="mw-dot"></div><div class="mw-dot"></div>';
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeLoading() {
    const loadingDiv = document.getElementById('mw-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  async function sendMessage() {
    const input = document.getElementById('mosquito-widget-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage(text, 'user');
    showLoading();

    chatHistory.push({
      role: 'user',
      parts: [{ text: text }]
    });

    try {
      const responseText = await callGeminiAPI(chatHistory);
      removeLoading();
      addMessage(responseText, 'assistant');

      chatHistory.push({
        role: 'model',
        parts: [{ text: responseText }]
      });
    } catch (error) {
      removeLoading();
      console.error('Ошибка API:', error);
      addMessage('Произошла ошибка при подключении к ИИ. Проверьте API ключ или настройки модели.', 'assistant');
      chatHistory.pop();
    }
  }

  async function callGeminiAPI(history) {
    if (WIDGET_CONFIG.apiKey === 'ВАШ_GEMINI_API_KEY') {
      return "Пожалуйста, укажите ваш реальный API ключ Gemini в файле widget.js (в переменной WIDGET_CONFIG.apiKey).";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${WIDGET_CONFIG.model}:generateContent?key=${WIDGET_CONFIG.apiKey}`;
    
    const requestBody = {
      system_instruction: {
        parts: [{ text: WIDGET_CONFIG.systemInstruction }]
      },
      contents: history
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'API request failed');
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "Извините, не удалось получить ответ от модели.";
  }

  // Инициализация виджета после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
