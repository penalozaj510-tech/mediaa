/* ============================================
   PROMPTER STUDIO — Application Logic
   ABM (Altas, Bajas, Modificaciones) + Google Apps Script Integration
   ============================================ */

(function () {
  'use strict';

  // ============================
  // Configuration
  // ============================
  const CONFIG = {
    // ⚠️ IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
    // After deploying, paste the URL here and set USE_GAS to true
    GAS_URL: '',
    USE_GAS: false, // Set to true when you have a deployed Web App URL
    TOAST_DURATION: 3500,
    DEBOUNCE_DELAY: 300,
  };

  // ============================
  // Demo Data (used when USE_GAS = false)
  // ============================
  const DEMO_DATA = [
    {
      row: 2,
      categoria: 'Marketing',
      nombre: 'Generador de Copy',
      prompt: 'Actúa como un experto en copywriting y marketing digital. Crea 5 variaciones de copy para una publicación en redes sociales que promueva [PRODUCTO/SERVICIO]. El copy debe ser persuasivo, incluir un call-to-action claro y adaptarse al tono de la marca. Genera versiones para Instagram, Twitter y LinkedIn.',
      ejemplos: 'Producto: Curso de fotografía online\n\nInstagram: "📸 ¿Sueñas con capturar momentos inolvidables? Nuestro curso te lleva de principiante a fotógrafo profesional en 8 semanas. ¡Inscríbete hoy con 40% de descuento! Link en bio 👆"\n\nTwitter: "De selfies a fotos profesionales 📸 Aprende fotografía desde casa con nuestro curso certificado. Últimos cupos con descuento → [link]"'
    },
    {
      row: 3,
      categoria: 'Programación',
      nombre: 'Code Reviewer',
      prompt: 'Actúa como un ingeniero de software senior. Revisa el siguiente código e identifica: 1) Bugs potenciales, 2) Problemas de rendimiento, 3) Malas prácticas, 4) Sugerencias de mejora. Proporciona el código corregido con comentarios explicativos.\n\nCódigo a revisar:\n[PEGAR CÓDIGO AQUÍ]',
      ejemplos: 'Input: función con un loop ineficiente\nOutput: "Bug encontrado en línea 15: posible null pointer exception. Sugerencia: agregar validación de entrada antes del loop. Rendimiento: reemplazar array.find() dentro del for por un Map para reducir complejidad de O(n²) a O(n)."'
    },
    {
      row: 4,
      categoria: 'Escritura',
      nombre: 'Resumen Ejecutivo',
      prompt: 'Actúa como un consultor de negocios senior. Genera un resumen ejecutivo profesional del siguiente documento/texto. El resumen debe incluir: 1) Contexto, 2) Hallazgos clave (máximo 5 puntos), 3) Recomendaciones, 4) Próximos pasos. Mantén un tono formal y conciso. Límite: 300 palabras.\n\nTexto a resumir:\n[PEGAR TEXTO AQUÍ]',
      ejemplos: 'Input: Informe trimestral de ventas de 10 páginas\nOutput: Resumen ejecutivo con: contexto del Q3 2025, 5 métricas clave de rendimiento, 3 recomendaciones estratégicas y timeline de implementación.'
    },
    {
      row: 5,
      categoria: 'Educación',
      nombre: 'Plan de Clase',
      prompt: 'Actúa como un educador experimentado. Diseña un plan de clase detallado para enseñar [TEMA] a estudiantes de [NIVEL]. Incluye: 1) Objetivos de aprendizaje (usando taxonomía de Bloom), 2) Actividades de apertura (10 min), 3) Desarrollo del tema (30 min), 4) Práctica guiada (15 min), 5) Cierre y evaluación (5 min). Incluye materiales necesarios y adaptaciones para diferentes estilos de aprendizaje.',
      ejemplos: 'Tema: Fracciones equivalentes\nNivel: 4to grado de primaria\n\nObjetivo: Los estudiantes podrán identificar y crear fracciones equivalentes usando modelos visuales.\n\nApertura: Juego "Pizza Party" donde dividen pizzas de papel en partes iguales.\n\nDesarrollo: Manipulación de tiras de fracciones con colores.'
    },
    {
      row: 6,
      categoria: 'Marketing',
      nombre: 'Email Marketing',
      prompt: 'Actúa como un especialista en email marketing. Crea una secuencia de 3 emails para una campaña de [OBJETIVO]. Cada email debe incluir: 1) Línea de asunto atractiva (máx. 50 caracteres), 2) Texto de preheader, 3) Cuerpo del email con storytelling, 4) CTA principal, 5) P.D. persuasivo. La secuencia debe seguir la estructura: Introducción → Valor → Urgencia.',
      ejemplos: 'Objetivo: Lanzamiento de producto SaaS\n\nEmail 1 - Asunto: "Algo increíble está por llegar 🚀"\nEmail 2 - Asunto: "Cómo [producto] ahorra 10 horas/semana"\nEmail 3 - Asunto: "Últimas 24h: precio de lanzamiento"'
    },
    {
      row: 7,
      categoria: 'Programación',
      nombre: 'Debug Assistant',
      prompt: 'Actúa como un debugger experto. Estoy experimentando el siguiente error en mi aplicación:\n\nError: [PEGAR ERROR AQUÍ]\nLenguaje/Framework: [ESPECIFICAR]\nContexto: [DESCRIBIR QUÉ ESTABAS HACIENDO]\n\nAnaliza el error paso a paso, explica la causa raíz en términos simples y proporciona la solución con código corregido. Si hay múltiples posibles causas, enuméralas de más probable a menos probable.',
      ejemplos: 'Error: "TypeError: Cannot read property \'map\' of undefined"\nLenguaje: React/JavaScript\nContexto: Al cargar datos de una API\n\nCausa: El estado inicial no es un array.\nSolución: Inicializar con useState([]) y agregar optional chaining (data?.map).'
    },
    {
      row: 8,
      categoria: 'Escritura',
      nombre: 'Blog Post',
      prompt: 'Actúa como un escritor de contenido especializado en SEO. Escribe un artículo de blog de 800-1000 palabras sobre [TEMA]. Incluye: 1) Título H1 atractivo con keyword principal, 2) Introducción con hook, 3) Al menos 3 subtítulos H2, 4) Bullet points donde sea apropiado, 5) Conclusión con CTA, 6) Meta description (155 caracteres). Tono: [FORMAL/CASUAL/TÉCNICO]. Keyword principal: [KEYWORD].',
      ejemplos: 'Tema: Productividad remota\nKeyword: "trabajar desde casa productivamente"\nTono: Casual\n\nTítulo: "7 Secretos para Trabajar desde Casa Productivamente (Sin Volverte Loco)"\nMeta: "Descubre 7 estrategias probadas para ser más productivo trabajando remoto. Tips prácticos que puedes aplicar hoy mismo."'
    },
    {
      row: 9,
      categoria: 'Educación',
      nombre: 'Quiz Generator',
      prompt: 'Actúa como un diseñador instruccional. Crea un cuestionario de evaluación sobre [TEMA] para [NIVEL]. Genera:\n- 5 preguntas de opción múltiple (4 opciones cada una)\n- 3 preguntas de verdadero/falso\n- 2 preguntas abiertas de desarrollo\n\nIncluye las respuestas correctas con explicaciones breves. Las preguntas deben cubrir diferentes niveles cognitivos (recordar, comprender, aplicar, analizar).',
      ejemplos: 'Tema: Sistema solar\nNivel: Secundaria\n\n1. ¿Cuál es el planeta más grande del sistema solar?\na) Saturno  b) Júpiter ✓  c) Neptuno  d) Urano\nExplicación: Júpiter tiene un diámetro de 139,820 km, siendo el más grande.'
    },
    {
      row: 10,
      categoria: 'Diseño',
      nombre: 'Brief Creativo',
      prompt: 'Actúa como un director creativo de una agencia de publicidad. Genera un brief creativo completo para [PROYECTO]. Incluye: 1) Resumen del proyecto, 2) Público objetivo (demographics + psychographics), 3) Mensaje clave, 4) Tono y personalidad de marca, 5) Entregables requeridos, 6) Referencias visuales sugeridas, 7) Restricciones y consideraciones, 8) Timeline propuesto.',
      ejemplos: 'Proyecto: Rediseño de identidad visual para cafetería artesanal\n\nPúblico: Millennials urbanos, 25-35 años, valoran experiencias auténticas\nMensaje clave: "Cada taza cuenta una historia"\nTono: Cálido, artesanal, auténtico\nEntregables: Logo, paleta de colores, tipografía, packaging, menú'
    },
    {
      row: 11,
      categoria: 'Negocios',
      nombre: 'Pitch Deck',
      prompt: 'Actúa como un consultor de startups y venture capital. Ayúdame a estructurar un pitch deck de 10 slides para [EMPRESA/IDEA]. Cada slide debe incluir: título, contenido clave (bullet points) y notas del presentador. Estructura: 1) Problema, 2) Solución, 3) Mercado objetivo, 4) Modelo de negocio, 5) Tracción, 6) Competencia, 7) Equipo, 8) Finanzas, 9) Ask (inversión), 10) Visión.',
      ejemplos: 'Empresa: App de delivery de comida saludable\n\nSlide 1 - Problema: "El 73% de profesionales no come saludable por falta de tiempo. Las apps de delivery actuales priorizan comida rápida sobre nutrición."\n\nSlide 2 - Solución: "NutriExpress: Delivery de comidas balanceadas, diseñadas por nutriólogos, listas en 30 min."'
    }
  ];

  // ============================
  // State
  // ============================
  let state = {
    prompts: [],
    filteredPrompts: [],
    categories: [],
    currentView: 'grid', // 'grid' | 'table'
    editingRow: null,
    deletingRow: null,
    deletingName: '',
  };

  // ============================
  // DOM References
  // ============================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const DOM = {
    // Theme
    themeToggle: $('#themeToggle'),
    // Stats
    statTotal: $('#statTotal'),
    statCategories: $('#statCategories'),
    statWithExamples: $('#statWithExamples'),
    statRecent: $('#statRecent'),
    // Toolbar
    searchInput: $('#searchInput'),
    categoryFilter: $('#categoryFilter'),
    viewGrid: $('#viewGrid'),
    viewTable: $('#viewTable'),
    // Views
    promptsGrid: $('#promptsGrid'),
    promptsTableWrapper: $('#promptsTableWrapper'),
    promptsTableBody: $('#promptsTableBody'),
    // Modals
    modalPrompt: $('#modalPrompt'),
    modalConfirm: $('#modalConfirm'),
    modalDetail: $('#modalDetail'),
    modalTitle: $('#modalTitle'),
    // Form
    promptForm: $('#promptForm'),
    promptRow: $('#promptRow'),
    promptCategory: $('#promptCategory'),
    customCategoryGroup: $('#customCategoryGroup'),
    customCategory: $('#customCategory'),
    promptName: $('#promptName'),
    promptText: $('#promptText'),
    promptExamples: $('#promptExamples'),
    // Buttons
    btnNewPrompt: $('#btnNewPrompt'),
    modalClose: $('#modalClose'),
    btnCancelPrompt: $('#btnCancelPrompt'),
    btnSavePrompt: $('#btnSavePrompt'),
    confirmClose: $('#confirmClose'),
    btnCancelDelete: $('#btnCancelDelete'),
    btnConfirmDelete: $('#btnConfirmDelete'),
    detailClose: $('#detailClose'),
    detailCloseBtn: $('#detailCloseBtn'),
    detailCopyBtn: $('#detailCopyBtn'),
    // Detail
    detailTitle: $('#detailTitle'),
    detailCategory: $('#detailCategory'),
    detailPrompt: $('#detailPrompt'),
    detailExamples: $('#detailExamples'),
    // Confirm
    confirmPromptName: $('#confirmPromptName'),
    // Toast & Loading
    toastContainer: $('#toastContainer'),
    loadingOverlay: $('#loadingOverlay'),
  };

  // ============================
  // Theme Management
  // ============================
  function initTheme() {
    const saved = localStorage.getItem('prompter-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('prompter-theme', next);
  }

  // ============================
  // Toast Notifications
  // ============================
  function showToast(message, type = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type]}</span>
      <span class="toast__message">${escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Cerrar">✕</button>
    `;

    DOM.toastContainer.appendChild(toast);

    toast.querySelector('.toast__close').addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), CONFIG.TOAST_DURATION);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  // ============================
  // Loading
  // ============================
  function showLoading() {
    DOM.loadingOverlay.classList.add('active');
  }

  function hideLoading() {
    DOM.loadingOverlay.classList.remove('active');
  }

  // ============================
  // Data Layer (Google Apps Script or Demo)
  // ============================
  async function fetchPrompts() {
    if (CONFIG.USE_GAS && CONFIG.GAS_URL) {
      try {
        const response = await fetch(`${CONFIG.GAS_URL}?action=getPrompts`);
        const data = await response.json();
        if (data.status === 'success') {
          return data.data;
        } else {
          throw new Error(data.message || 'Error al obtener prompts');
        }
      } catch (err) {
        showToast('Error de conexión con Google Sheets: ' + err.message, 'error');
        return [];
      }
    }

    // Check if running inside Google Apps Script (HtmlService)
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler((err) => {
            showToast('Error: ' + err.message, 'error');
            reject(err);
          })
          .getPrompts();
      });
    }

    // Demo mode
    return JSON.parse(JSON.stringify(DEMO_DATA));
  }

  async function savePrompt(data) {
    if (CONFIG.USE_GAS && CONFIG.GAS_URL) {
      try {
        const response = await fetch(CONFIG.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'addPrompt', ...data }),
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return result;
      } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
        throw err;
      }
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .addPrompt(data);
      });
    }

    // Demo mode
    const newRow = Math.max(...state.prompts.map(p => p.row), 1) + 1;
    state.prompts.push({
      row: newRow,
      categoria: data.categoria,
      nombre: data.nombre,
      prompt: data.prompt,
      ejemplos: data.ejemplos || '',
    });
    return { status: 'success' };
  }

  async function updatePrompt(row, data) {
    if (CONFIG.USE_GAS && CONFIG.GAS_URL) {
      try {
        const response = await fetch(CONFIG.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'updatePrompt', row, ...data }),
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return result;
      } catch (err) {
        showToast('Error al actualizar: ' + err.message, 'error');
        throw err;
      }
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .updatePrompt(row, data);
      });
    }

    // Demo mode
    const idx = state.prompts.findIndex(p => p.row === row);
    if (idx !== -1) {
      state.prompts[idx] = { ...state.prompts[idx], ...data };
    }
    return { status: 'success' };
  }

  async function deletePrompt(row) {
    if (CONFIG.USE_GAS && CONFIG.GAS_URL) {
      try {
        const response = await fetch(CONFIG.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'deletePrompt', row }),
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return result;
      } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
        throw err;
      }
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .deletePrompt(row);
      });
    }

    // Demo mode
    state.prompts = state.prompts.filter(p => p.row !== row);
    return { status: 'success' };
  }

  // ============================
  // Rendering
  // ============================
  function renderStats() {
    const total = state.prompts.length;
    const categories = [...new Set(state.prompts.map(p => p.categoria))].length;
    const withExamples = state.prompts.filter(p => p.ejemplos && p.ejemplos.trim()).length;
    const shown = state.filteredPrompts.length;

    animateNumber(DOM.statTotal, total);
    animateNumber(DOM.statCategories, categories);
    animateNumber(DOM.statWithExamples, withExamples);
    animateNumber(DOM.statRecent, shown);
  }

  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 400;
    const start = performance.now();

    function step(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(current + (target - current) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function renderCategories() {
    state.categories = [...new Set(state.prompts.map(p => p.categoria))].sort();

    // Update filter dropdown
    const currentVal = DOM.categoryFilter.value;
    DOM.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    state.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      DOM.categoryFilter.appendChild(opt);
    });
    DOM.categoryFilter.value = currentVal;

    // Update form category dropdown (keep special options)
    const formSelect = DOM.promptCategory;
    const currentFormVal = formSelect.value;
    formSelect.innerHTML = `
      <option value="">Seleccionar categoría...</option>
      ${state.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
      <option value="__custom__">+ Nueva categoría...</option>
    `;
    formSelect.value = currentFormVal;
  }

  function renderGrid() {
    if (state.filteredPrompts.length === 0) {
      DOM.promptsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No se encontraron prompts</h3>
          <p class="empty-state__text">Intenta cambiar los filtros de búsqueda o crea un nuevo prompt.</p>
        </div>
      `;
      return;
    }

    DOM.promptsGrid.innerHTML = state.filteredPrompts.map((p, i) => `
      <article class="prompt-card" style="animation-delay: ${i * 50}ms" data-row="${p.row}">
        <div class="prompt-card__header">
          <span class="prompt-card__category" data-cat="${p.categoria.toLowerCase()}">${escapeHtml(p.categoria)}</span>
          <div class="prompt-card__actions">
            <button class="btn--icon edit" title="Editar" onclick="window.app.editPrompt(${p.row})">✏️</button>
            <button class="btn--icon delete" title="Eliminar" onclick="window.app.confirmDelete(${p.row}, '${escapeAttr(p.nombre)}')">🗑️</button>
          </div>
        </div>
        <h3 class="prompt-card__title">${escapeHtml(p.nombre)}</h3>
        <p class="prompt-card__prompt">${escapeHtml(p.prompt)}</p>
        <div class="prompt-card__footer">
          <span class="prompt-card__example-badge">
            ${p.ejemplos && p.ejemplos.trim() ? '📝 Con ejemplo' : '📄 Sin ejemplo'}
          </span>
          <button class="prompt-card__copy-btn" onclick="window.app.copyPrompt(${p.row}, this)">
            📋 Copiar
          </button>
        </div>
      </article>
    `).join('');

    // Add click to open detail
    DOM.promptsGrid.querySelectorAll('.prompt-card__title').forEach(titleEl => {
      titleEl.style.cursor = 'pointer';
      titleEl.addEventListener('click', (e) => {
        const row = parseInt(e.target.closest('.prompt-card').dataset.row);
        window.app.viewDetail(row);
      });
    });
  }

  function renderTable() {
    if (state.filteredPrompts.length === 0) {
      DOM.promptsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 3rem;">
            <div class="empty-state__icon">🔍</div>
            <p style="color: var(--text-tertiary);">No se encontraron prompts</p>
          </td>
        </tr>
      `;
      return;
    }

    DOM.promptsTableBody.innerHTML = state.filteredPrompts.map(p => `
      <tr data-row="${p.row}">
        <td><span class="prompt-card__category" data-cat="${p.categoria.toLowerCase()}">${escapeHtml(p.categoria)}</span></td>
        <td><strong style="cursor:pointer" onclick="window.app.viewDetail(${p.row})">${escapeHtml(p.nombre)}</strong></td>
        <td class="prompt-col" title="${escapeAttr(p.prompt)}">${escapeHtml(p.prompt)}</td>
        <td>${p.ejemplos && p.ejemplos.trim() ? '📝 Sí' : '—'}</td>
        <td class="actions-col">
          <button class="btn--icon copy" title="Copiar" onclick="window.app.copyPrompt(${p.row}, this)">📋</button>
          <button class="btn--icon edit" title="Editar" onclick="window.app.editPrompt(${p.row})">✏️</button>
          <button class="btn--icon delete" title="Eliminar" onclick="window.app.confirmDelete(${p.row}, '${escapeAttr(p.nombre)}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  function render() {
    renderStats();
    renderGrid();
    renderTable();
  }

  // ============================
  // Filtering
  // ============================
  function applyFilters() {
    const search = DOM.searchInput.value.toLowerCase().trim();
    const category = DOM.categoryFilter.value;

    state.filteredPrompts = state.prompts.filter(p => {
      const matchesCategory = !category || p.categoria === category;
      const matchesSearch = !search ||
        p.nombre.toLowerCase().includes(search) ||
        p.prompt.toLowerCase().includes(search) ||
        p.categoria.toLowerCase().includes(search) ||
        (p.ejemplos && p.ejemplos.toLowerCase().includes(search));
      return matchesCategory && matchesSearch;
    });

    render();
  }

  // ============================
  // Modal Management
  // ============================
  function openModal(overlayEl) {
    overlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlayEl) {
    overlayEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openNewPromptModal() {
    state.editingRow = null;
    DOM.modalTitle.textContent = 'Nuevo Prompt';
    DOM.promptForm.reset();
    DOM.promptRow.value = '';
    DOM.customCategoryGroup.style.display = 'none';
    clearFormErrors();
    openModal(DOM.modalPrompt);
  }

  function openEditPromptModal(row) {
    const prompt = state.prompts.find(p => p.row === row);
    if (!prompt) return;

    state.editingRow = row;
    DOM.modalTitle.textContent = 'Editar Prompt';
    DOM.promptRow.value = row;

    // Check if category exists in dropdown
    const categoryExists = [...DOM.promptCategory.options].some(o => o.value === prompt.categoria);
    if (categoryExists) {
      DOM.promptCategory.value = prompt.categoria;
      DOM.customCategoryGroup.style.display = 'none';
    } else {
      DOM.promptCategory.value = '__custom__';
      DOM.customCategoryGroup.style.display = 'block';
      DOM.customCategory.value = prompt.categoria;
    }

    DOM.promptName.value = prompt.nombre;
    DOM.promptText.value = prompt.prompt;
    DOM.promptExamples.value = prompt.ejemplos || '';
    clearFormErrors();
    openModal(DOM.modalPrompt);
  }

  // ============================
  // CRUD Operations
  // ============================
  async function handleSavePrompt() {
    // Validate
    if (!validateForm()) return;

    let categoria = DOM.promptCategory.value;
    if (categoria === '__custom__') {
      categoria = DOM.customCategory.value.trim();
    }

    const data = {
      categoria,
      nombre: DOM.promptName.value.trim(),
      prompt: DOM.promptText.value.trim(),
      ejemplos: DOM.promptExamples.value.trim(),
    };

    showLoading();

    try {
      if (state.editingRow) {
        await updatePrompt(state.editingRow, data);
        showToast(`Prompt "${data.nombre}" actualizado correctamente`, 'success');
      } else {
        await savePrompt(data);
        showToast(`Prompt "${data.nombre}" creado correctamente`, 'success');
      }

      closeModal(DOM.modalPrompt);
      await loadPrompts();
    } catch (err) {
      showToast('Error al guardar el prompt', 'error');
    } finally {
      hideLoading();
    }
  }

  async function handleDeletePrompt() {
    if (!state.deletingRow) return;

    showLoading();

    try {
      await deletePrompt(state.deletingRow);
      showToast('Prompt eliminado correctamente', 'success');
      closeModal(DOM.modalConfirm);
      await loadPrompts();
    } catch (err) {
      showToast('Error al eliminar el prompt', 'error');
    } finally {
      hideLoading();
      state.deletingRow = null;
    }
  }

  // ============================
  // Form Validation
  // ============================
  function validateForm() {
    clearFormErrors();
    let valid = true;

    let categoria = DOM.promptCategory.value;
    if (!categoria) {
      setFieldError(DOM.promptCategory);
      valid = false;
    }
    if (categoria === '__custom__' && !DOM.customCategory.value.trim()) {
      setFieldError(DOM.customCategory);
      valid = false;
    }
    if (!DOM.promptName.value.trim()) {
      setFieldError(DOM.promptName);
      valid = false;
    }
    if (!DOM.promptText.value.trim()) {
      setFieldError(DOM.promptText);
      valid = false;
    }

    if (!valid) {
      showToast('Por favor completa todos los campos obligatorios', 'warning');
    }

    return valid;
  }

  function setFieldError(el) {
    el.classList.add('error');
  }

  function clearFormErrors() {
    DOM.promptForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  // ============================
  // Copy to Clipboard
  // ============================
  async function copyToClipboard(row, btnEl) {
    const prompt = state.prompts.find(p => p.row === row);
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.prompt);
      if (btnEl) {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = '✅ Copiado';
        btnEl.classList.add('copied');
        setTimeout(() => {
          btnEl.innerHTML = original;
          btnEl.classList.remove('copied');
        }, 2000);
      }
      showToast('Prompt copiado al portapapeles', 'success');
    } catch {
      showToast('No se pudo copiar al portapapeles', 'error');
    }
  }

  // ============================
  // Detail View
  // ============================
  function viewDetail(row) {
    const prompt = state.prompts.find(p => p.row === row);
    if (!prompt) return;

    DOM.detailTitle.textContent = prompt.nombre;
    DOM.detailCategory.textContent = prompt.categoria;
    DOM.detailPrompt.textContent = prompt.prompt;
    DOM.detailExamples.textContent = prompt.ejemplos || 'Sin ejemplos';

    // Store row for copy button
    DOM.detailCopyBtn.dataset.row = row;

    openModal(DOM.modalDetail);
  }

  // ============================
  // View Toggle
  // ============================
  function setView(view) {
    state.currentView = view;
    if (view === 'grid') {
      DOM.promptsGrid.classList.add('active');
      DOM.promptsTableWrapper.classList.remove('active');
      DOM.viewGrid.classList.add('active');
      DOM.viewTable.classList.remove('active');
    } else {
      DOM.promptsGrid.classList.remove('active');
      DOM.promptsTableWrapper.classList.add('active');
      DOM.viewGrid.classList.remove('active');
      DOM.viewTable.classList.add('active');
    }
  }

  // ============================
  // Data Loading
  // ============================
  async function loadPrompts() {
    try {
      const data = await fetchPrompts();
      state.prompts = data;
      renderCategories();
      applyFilters();
    } catch (err) {
      showToast('Error al cargar los prompts', 'error');
    }
  }

  // ============================
  // Utilities
  // ============================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ============================
  // Event Listeners
  // ============================
  function bindEvents() {
    // Theme toggle
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // New prompt
    DOM.btnNewPrompt.addEventListener('click', openNewPromptModal);

    // Close modals
    DOM.modalClose.addEventListener('click', () => closeModal(DOM.modalPrompt));
    DOM.btnCancelPrompt.addEventListener('click', () => closeModal(DOM.modalPrompt));
    DOM.confirmClose.addEventListener('click', () => closeModal(DOM.modalConfirm));
    DOM.btnCancelDelete.addEventListener('click', () => closeModal(DOM.modalConfirm));
    DOM.detailClose.addEventListener('click', () => closeModal(DOM.modalDetail));
    DOM.detailCloseBtn.addEventListener('click', () => closeModal(DOM.modalDetail));

    // Close modal on overlay click
    [DOM.modalPrompt, DOM.modalConfirm, DOM.modalDetail].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [DOM.modalPrompt, DOM.modalConfirm, DOM.modalDetail].forEach(m => {
          if (m.classList.contains('active')) closeModal(m);
        });
      }
    });

    // Save prompt
    DOM.btnSavePrompt.addEventListener('click', handleSavePrompt);

    // Delete prompt
    DOM.btnConfirmDelete.addEventListener('click', handleDeletePrompt);

    // Detail copy
    DOM.detailCopyBtn.addEventListener('click', () => {
      const row = parseInt(DOM.detailCopyBtn.dataset.row);
      copyToClipboard(row, DOM.detailCopyBtn);
    });

    // Custom category toggle
    DOM.promptCategory.addEventListener('change', () => {
      DOM.customCategoryGroup.style.display =
        DOM.promptCategory.value === '__custom__' ? 'block' : 'none';
    });

    // Search with debounce
    DOM.searchInput.addEventListener('input', debounce(applyFilters, CONFIG.DEBOUNCE_DELAY));

    // Category filter
    DOM.categoryFilter.addEventListener('change', applyFilters);

    // View toggle
    DOM.viewGrid.addEventListener('click', () => setView('grid'));
    DOM.viewTable.addEventListener('click', () => setView('table'));

    // Form submit prevention
    DOM.promptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSavePrompt();
    });
  }

  // ============================
  // Public API (for inline onclick handlers)
  // ============================
  window.app = {
    editPrompt: (row) => openEditPromptModal(row),
    confirmDelete: (row, name) => {
      state.deletingRow = row;
      state.deletingName = name;
      DOM.confirmPromptName.textContent = `"${name}"`;
      openModal(DOM.modalConfirm);
    },
    copyPrompt: (row, btn) => copyToClipboard(row, btn),
    viewDetail: (row) => viewDetail(row),
  };

  // ============================
  // Initialize
  // ============================
  async function init() {
    initTheme();
    bindEvents();
    showLoading();

    try {
      await loadPrompts();
    } finally {
      hideLoading();
    }

    console.log('%c⚡ Prompter Studio', 'font-size: 20px; font-weight: bold; color: #7c5cfc;');
    console.log('%cAdmin de Prompts listo.', 'color: #888;');

    if (!CONFIG.USE_GAS && !(typeof google !== 'undefined' && google.script)) {
      console.log('%c📋 Modo Demo activo — Los datos no se persisten.', 'color: #f59e0b; font-weight: bold;');
    }
  }

  // Run!
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
