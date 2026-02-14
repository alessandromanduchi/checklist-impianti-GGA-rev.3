// State
let checklistData = [];
let malfunctions = [];
let visibleNicheCount = 10; // Pagination: show 10 niches at a time
let startNiche = null; // Starting niche for verification
let direction = null; // Direction of verification
let sortedNicheIndices = []; // Store sorted indices based on config
let userFeedback = { problems: '', suggestions: '' }; // Store user feedback

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Clear all data on page reload - fresh start every time
    localStorage.removeItem('checklistData');
    localStorage.removeItem('malfunctions');
    localStorage.removeItem('verificationConfig');
    
    // Always start with config modal
    populateStartNicheSelect();
    document.getElementById('config-modal').classList.add('show');
    
    populateAllNichesSelect();
    registerServiceWorker();
});

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/checklist-impianti-GGA-rev.2/service-worker.js', {
            scope: '/checklist-impianti-GGA-rev.2/'
        })
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Configuration Modal Functions
function populateStartNicheSelect() {
    const select = document.getElementById('start-niche');
    select.innerHTML = '<option value="">Seleziona nicchia...</option>';
    
    TECH_NICHES_DATA.forEach((niche, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Km ${niche.km} - Binario ${niche.binario}`;
        select.appendChild(option);
    });
}

document.getElementById('config-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const startNicheIndex = parseInt(document.getElementById('start-niche').value);
    const selectedDirection = document.getElementById('direction').value;
    
    startNiche = startNicheIndex;
    direction = selectedDirection;
    
    // Save configuration
    localStorage.setItem('verificationConfig', JSON.stringify({
        startNiche,
        direction
    }));
    
    // Close modal and initialize
    document.getElementById('config-modal').classList.remove('show');
    initializeChecklist();
    updateProgress();
});

function initializeChecklist() {
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';
    checklistData = [];
    sortedNicheIndices = [];
    
    // Sort niches based on configuration
    if (startNiche !== null && direction !== null) {
        // Parse km values for sorting
        const parseKm = (km) => {
            const parts = km.split('+');
            return parseFloat(parts[0]) + parseFloat(parts[1]) / 1000;
        };
        
        // Create sorted indices array
        const indices = TECH_NICHES_DATA.map((_, idx) => idx);
        
        if (direction === 'vernio') {
            // Sort descending (towards Vernio 37+259)
            indices.sort((a, b) => {
                const kmA = parseKm(TECH_NICHES_DATA[a].km);
                const kmB = parseKm(TECH_NICHES_DATA[b].km);
                return kmB - kmA;
            });
        } else {
            // Sort ascending (towards San Benedetto 55+742)
            indices.sort((a, b) => {
                const kmA = parseKm(TECH_NICHES_DATA[a].km);
                const kmB = parseKm(TECH_NICHES_DATA[b].km);
                return kmA - kmB;
            });
        }
        
        // Find starting position
        const startPosition = indices.indexOf(startNiche);
        if (startPosition !== -1) {
            // Reorder to start from selected niche
            sortedNicheIndices = indices.slice(startPosition).concat(indices.slice(0, startPosition));
        } else {
            sortedNicheIndices = indices;
        }
    } else {
        // Default: use original order
        sortedNicheIndices = TECH_NICHES_DATA.map((_, idx) => idx);
    }
    
    // Initialize all items but only show first 10
    sortedNicheIndices.forEach((originalIndex, displayIndex) => {
        const niche = TECH_NICHES_DATA[originalIndex];
        const item = {
            id: `${niche.km}-${niche.binario}`,
            km: niche.km,
            binario: niche.binario,
            types: niche.types,
            completed: false,
            checks: {},
            photosByType: {},
            needsPhoto: {},
            timestamp: null,
            displayIndex: displayIndex
        };
        
        // Initialize checks based on tech types
        niche.types.forEach(type => {
            if (type === 'idrante') {
                item.checks.idrante_stato = null;
                item.checks.idrante_sigillo = null;
                item.checks.idrante_segnaletica = null;
                item.photosByType.idrante_stato = [];
                item.photosByType.idrante_sigillo = [];
                item.photosByType.idrante_segnaletica = [];
                item.needsPhoto.idrante_stato = false;
                item.needsPhoto.idrante_sigillo = false;
                item.needsPhoto.idrante_segnaletica = false;
            }
            if (type === 'tem') {
                item.checks.tem_stato = null;
                item.checks.tem_sigillo = null;
                item.checks.tem_segnaletica = null;
                item.photosByType.tem_stato = [];
                item.photosByType.tem_sigillo = [];
                item.photosByType.tem_segnaletica = [];
                item.needsPhoto.tem_stato = false;
                item.needsPhoto.tem_sigillo = false;
                item.needsPhoto.tem_segnaletica = false;
            }
            if (type === 'quadro_vvf') {
                item.checks.quadro_stato = null;
                item.checks.quadro_sigillo = null;
                item.checks.quadro_segnaletica = null;
                item.photosByType.quadro_stato = [];
                item.photosByType.quadro_sigillo = [];
                item.photosByType.quadro_segnaletica = [];
                item.needsPhoto.quadro_stato = false;
                item.needsPhoto.quadro_sigillo = false;
                item.needsPhoto.quadro_segnaletica = false;
            }
        });
        
        checklistData.push(item);
        
        // Only create DOM element if within visible range
        if (displayIndex < visibleNicheCount) {
            const itemEl = createChecklistItem(item, displayIndex);
            checklist.appendChild(itemEl);
        }
    });
    
    // Update pagination button visibility
    updatePaginationButton();
    
    document.getElementById('niche-count').textContent = `${TECH_NICHES_DATA.length} Nicchie`;
}

function showMoreNiches() {
    const checklist = document.getElementById('checklist');
    const currentVisible = visibleNicheCount;
    visibleNicheCount = Math.min(visibleNicheCount + 10, checklistData.length);
    
    // Add next 10 items
    for (let i = currentVisible; i < visibleNicheCount; i++) {
        const item = checklistData[i];
        const itemEl = createChecklistItem(item, i);
        checklist.appendChild(itemEl);
        
        // If this item has saved data, restore it
        const savedData = localStorage.getItem('checklistData');
        if (savedData) {
            const savedItems = JSON.parse(savedData);
            const savedItem = savedItems.find(si => si.id === item.id);
            if (savedItem) {
                Object.assign(item, savedItem);
                
                // Update UI
                Object.keys(item.checks).forEach(checkType => {
                    if (item.checks[checkType]) {
                        const radio = document.querySelector(`input[name="${checkType}-${item.id}"][value="${item.checks[checkType]}"]`);
                        if (radio) {
                            radio.checked = true;
                            handleCheck(item.id, checkType, item.checks[checkType]);
                        }
                    }
                });
                
                // Display photos
                Object.keys(item.photosByType).forEach(checkType => {
                    displayPhotos(item.id, checkType);
                });
                
                if (item.completed) {
                    itemEl.classList.add('completed');
                }
                
                updateMeta(item.id);
            }
        }
    }
    
    updatePaginationButton();
}

function updatePaginationButton() {
    const container = document.getElementById('pagination-container');
    if (visibleNicheCount < checklistData.length) {
        container.style.display = 'block';
        const remaining = checklistData.length - visibleNicheCount;
        const toShow = Math.min(10, remaining);
        container.querySelector('button').textContent = `Mostra altre ${toShow}`;
    } else {
        container.style.display = 'none';
    }
}

function createChecklistItem(item, index) {
    const div = document.createElement('div');
    div.className = 'check-item';
    div.id = `item-${item.id}`;
    
    let techBadgesHTML = '';
    item.types.forEach(type => {
        if (type === 'idrante') {
            techBadgesHTML += '<span class="tech-badge idrante">Idrante VVF</span>';
        }
        if (type === 'tem') {
            techBadgesHTML += '<span class="tech-badge tem">TEM</span>';
        }
        if (type === 'quadro_vvf') {
            techBadgesHTML += '<span class="tech-badge quadro">Quadro VVF</span>';
        }
    });
    
    let checksHTML = '';
    
    // Create checks for each tech type
    item.types.forEach(type => {
        const typeLabel = type === 'idrante' ? 'Idrante VVF' : (type === 'tem' ? 'Colonnina TEM' : 'Quadro VVF');
        const typePrefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
        
        checksHTML += `
            <div class="check-section">
                <h4 style="color: var(--text-primary); margin-bottom: 1rem; font-weight: 600;">${typeLabel}</h4>
                
                <div class="check-label">Stato dell'apprestamento</div>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_stato-${item.id}" value="funzionante" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_stato', 'funzionante')">
                        <span>Funzionante</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_stato-${item.id}" value="non_funzionante" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_stato', 'non_funzionante')">
                        <span>Non Funzionante</span>
                    </label>
                </div>
                <div class="photo-btn" id="photo-btn-${typePrefix}-stato-${item.id}">
                    <input type="file" accept="image/*" capture="environment" multiple 
                        onchange="handlePhotos(event, '${item.id}', '${typePrefix}_stato')" 
                        style="display: none;" id="photo-input-${typePrefix}-stato-${item.id}">
                    <label for="photo-input-${typePrefix}-stato-${item.id}" style="cursor: pointer; display: block;">
                        Allega Foto (obbligatoria)
                    </label>
                </div>
                <div id="photos-${typePrefix}-stato-${item.id}" class="photo-preview"></div>
                
                <div class="check-label" style="margin-top: 1rem;">Verifica manomissione sigillo</div>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_sigillo-${item.id}" value="integro" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_sigillo', 'integro')">
                        <span>Integro</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_sigillo-${item.id}" value="manomesso" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_sigillo', 'manomesso')">
                        <span>Manomesso</span>
                    </label>
                </div>
                <div class="photo-btn" id="photo-btn-${typePrefix}-sigillo-${item.id}">
                    <input type="file" accept="image/*" capture="environment" multiple 
                        onchange="handlePhotos(event, '${item.id}', '${typePrefix}_sigillo')" 
                        style="display: none;" id="photo-input-${typePrefix}-sigillo-${item.id}">
                    <label for="photo-input-${typePrefix}-sigillo-${item.id}" style="cursor: pointer; display: block;">
                        Allega Foto (obbligatoria)
                    </label>
                </div>
                <div id="photos-${typePrefix}-sigillo-${item.id}" class="photo-preview"></div>
                
                <div class="check-label" style="margin-top: 1rem;">Presenza segnaletica di riferimento</div>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_segnaletica-${item.id}" value="presente" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_segnaletica', 'presente')">
                        <span>Presente</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="${typePrefix}_segnaletica-${item.id}" value="assente" 
                            onchange="handleCheck('${item.id}', '${typePrefix}_segnaletica', 'assente')">
                        <span>Assente</span>
                    </label>
                </div>
                <div class="photo-btn" id="photo-btn-${typePrefix}-segnaletica-${item.id}">
                    <input type="file" accept="image/*" capture="environment" multiple 
                        onchange="handlePhotos(event, '${item.id}', '${typePrefix}_segnaletica')" 
                        style="display: none;" id="photo-input-${typePrefix}-segnaletica-${item.id}">
                    <label for="photo-input-${typePrefix}-segnaletica-${item.id}" style="cursor: pointer; display: block;">
                        Allega Foto (obbligatoria)
                    </label>
                </div>
                <div id="photos-${typePrefix}-segnaletica-${item.id}" class="photo-preview"></div>
            </div>
        `;
    });
    
    div.innerHTML = `
        <div class="item-header">
            <div>
                <div class="item-title">
                    <span>Km ${item.km} - Binario ${item.binario}</span>
                </div>
                <div class="tech-badges">
                    ${techBadgesHTML}
                </div>
            </div>
        </div>
        <div class="item-meta" id="meta-${item.id}">
            <span>Non verificata</span>
        </div>
        ${checksHTML}
    `;
    
    return div;
}

function handleCheck(itemId, checkType, value) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    item.checks[checkType] = value;
    
    // Determine if photo is needed (for negative responses)
    const needsPhoto = value === 'non_funzionante' || value === 'manomesso' || value === 'assente';
    item.needsPhoto[checkType] = needsPhoto;
    
    // Show/hide photo button
    const photoBtn = document.getElementById(`photo-btn-${checkType}-${itemId}`);
    if (photoBtn) {
        photoBtn.style.display = needsPhoto ? 'block' : 'none';
    }
    
    // Update radio label styling
    const radios = document.querySelectorAll(`input[name="${checkType}-${itemId}"]`);
    radios.forEach(radio => {
        const label = radio.closest('.radio-label');
        if (radio.checked) {
            label.style.borderColor = 'var(--primary)';
            if (value === 'funzionante' || value === 'integro' || value === 'presente') {
                label.classList.add('success');
                label.classList.remove('warning');
            } else {
                label.classList.add('warning');
                label.classList.remove('success');
            }
        } else {
            label.style.borderColor = 'var(--border)';
            label.classList.remove('success', 'warning');
        }
    });
    
    updateItemCompletion(itemId);
    saveToLocalStorage();
}

function handlePhotos(event, itemId, checkType) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!item.photosByType[checkType]) {
                item.photosByType[checkType] = [];
            }
            item.photosByType[checkType].push(e.target.result);
            displayPhotos(itemId, checkType);
            updateItemCompletion(itemId);
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    });
}

function displayPhotos(itemId, checkType) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    const container = document.getElementById(`photos-${checkType}-${itemId}`);
    if (!container) return;
    
    const photos = item.photosByType[checkType] || [];
    container.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="${photo}" alt="Foto ${index + 1}">
            <button class="photo-remove" onclick="removePhoto('${itemId}', '${checkType}', ${index})">×</button>
        `;
        container.appendChild(div);
    });
}

function removePhoto(itemId, checkType, photoIndex) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    item.photosByType[checkType].splice(photoIndex, 1);
    displayPhotos(itemId, checkType);
    updateItemCompletion(itemId);
    saveToLocalStorage();
}

function updateItemCompletion(itemId) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    let allChecked = true;
    let allPhotosProvided = true;
    
    // Check all required checks
    for (const type of item.types) {
        const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
        
        if (!item.checks[`${prefix}_stato`] || 
            !item.checks[`${prefix}_sigillo`] || 
            !item.checks[`${prefix}_segnaletica`]) {
            allChecked = false;
            break;
        }
        
        // Check if photos are required and provided
        if (item.needsPhoto[`${prefix}_stato`] && (!item.photosByType[`${prefix}_stato`] || item.photosByType[`${prefix}_stato`].length === 0)) {
            allPhotosProvided = false;
        }
        if (item.needsPhoto[`${prefix}_sigillo`] && (!item.photosByType[`${prefix}_sigillo`] || item.photosByType[`${prefix}_sigillo`].length === 0)) {
            allPhotosProvided = false;
        }
        if (item.needsPhoto[`${prefix}_segnaletica`] && (!item.photosByType[`${prefix}_segnaletica`] || item.photosByType[`${prefix}_segnaletica`].length === 0)) {
            allPhotosProvided = false;
        }
    }
    
    item.completed = allChecked && allPhotosProvided;
    
    if (item.completed) {
        item.timestamp = new Date().toISOString();
    }
    
    updateMeta(itemId);
    updateProgress();
    
    const itemEl = document.getElementById(`item-${itemId}`);
    if (item.completed) {
        itemEl.classList.add('completed');
    } else {
        itemEl.classList.remove('completed');
    }
}

function updateMeta(itemId) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    const metaEl = document.getElementById(`meta-${itemId}`);
    if (!metaEl) return;
    
    if (item.completed) {
        const date = new Date(item.timestamp);
        metaEl.innerHTML = `
            <span style="color: var(--accent)">Verificata</span>
            <span>${date.toLocaleString('it-IT')}</span>
        `;
    } else {
        metaEl.innerHTML = '<span>Non verificata</span>';
    }
}

function updateProgress() {
    const completed = checklistData.filter(i => i.completed).length;
    const total = checklistData.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = `${completed} / ${total} nicchie verificate`;
}

// Malfunction modal functions
function openMalfunctionModal() {
    document.getElementById('malfunction-modal').classList.add('show');
}

function closeMalfunctionModal() {
    document.getElementById('malfunction-modal').classList.remove('show');
    document.getElementById('malfunction-form').reset();
    updateMalfunctionForm();
}

function updateMalfunctionForm() {
    const type = document.getElementById('malfunction-type').value;
    const illuminazioneDetail = document.getElementById('illuminazione-detail');
    const corpiCountGroup = document.getElementById('corpi-count-group');
    
    if (type === 'illuminazione') {
        illuminazioneDetail.style.display = 'block';
    } else {
        illuminazioneDetail.style.display = 'none';
        corpiCountGroup.style.display = 'none';
    }
}

document.getElementById('illuminazione-fault-type')?.addEventListener('change', function() {
    const faultType = this.value;
    const corpiCountGroup = document.getElementById('corpi-count-group');
    
    if (faultType === 'corpi_illuminanti') {
        corpiCountGroup.style.display = 'block';
    } else {
        corpiCountGroup.style.display = 'none';
    }
});

function populateAllNichesSelect() {
    const select = document.getElementById('malfunction-km');
    select.innerHTML = '<option value="">Seleziona nicchia...</option>';
    
    ALL_NICHES_DATA.forEach(niche => {
        const option = document.createElement('option');
        option.value = `${niche.km}-${niche.binario}`;
        option.textContent = `${niche.km} - Binario ${niche.binario}`;
        select.appendChild(option);
    });
}

document.getElementById('malfunction-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const type = document.getElementById('malfunction-type').value;
    const km = document.getElementById('malfunction-km').value;
    const photoInput = document.getElementById('malfunction-photo');
    const notes = document.getElementById('malfunction-notes').value;
    
    if (!photoInput.files[0]) {
        showToast('Per favore allega una foto', 'error');
        return;
    }
    
    const malfunction = {
        id: Date.now().toString(),
        type: type,
        km: km,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    if (type === 'illuminazione') {
        const faultType = document.getElementById('illuminazione-fault-type').value;
        malfunction.illuminazioneFaultType = faultType;
        
        if (faultType === 'corpi_illuminanti') {
            malfunction.corpiCount = document.getElementById('corpi-count').value;
        }
    }
    
    // Read photo
    const reader = new FileReader();
    reader.onload = (e) => {
        malfunction.photo = e.target.result;
        malfunctions.push(malfunction);
        saveMalfunctionsToLocalStorage();
        showToast('Segnalazione salvata con successo', 'success');
        closeMalfunctionModal();
    };
    reader.readAsDataURL(photoInput.files[0]);
});

// LocalStorage functions
function saveToLocalStorage() {
    localStorage.setItem('checklistData', JSON.stringify(checklistData));
}

function saveMalfunctionsToLocalStorage() {
    localStorage.setItem('malfunctions', JSON.stringify(malfunctions));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('checklistData');
    if (saved) {
        const savedData = JSON.parse(saved);
        
        savedData.forEach(savedItem => {
            const item = checklistData.find(i => i.id === savedItem.id);
            if (item) {
                Object.assign(item, savedItem);
                
                // Update UI
                Object.keys(item.checks).forEach(checkType => {
                    if (item.checks[checkType]) {
                        const radio = document.querySelector(`input[name="${checkType}-${item.id}"][value="${item.checks[checkType]}"]`);
                        if (radio) {
                            radio.checked = true;
                            handleCheck(item.id, checkType, item.checks[checkType]);
                        }
                    }
                });
                
                // Display photos
                Object.keys(item.photosByType).forEach(checkType => {
                    displayPhotos(item.id, checkType);
                });
                
                const itemEl = document.getElementById(`item-${item.id}`);
                if (item.completed) {
                    itemEl.classList.add('completed');
                }
                
                updateMeta(item.id);
            }
        });
        
        updateProgress();
    }
    
    const savedMalfunctions = localStorage.getItem('malfunctions');
    if (savedMalfunctions) {
        malfunctions = JSON.parse(savedMalfunctions);
    }
}

// Clear all data without confirmation (used after PDF generation and on reload)
function clearAllData() {
    localStorage.removeItem('checklistData');
    localStorage.removeItem('malfunctions');
    localStorage.removeItem('verificationConfig');
    checklistData = [];
    malfunctions = [];
    visibleNicheCount = 10;
    startNiche = null;
    direction = null;
    sortedNicheIndices = [];
    userFeedback = { problems: '', suggestions: '' };
    
    // Show config modal again
    const checklist = document.getElementById('checklist');
    if (checklist) {
        checklist.innerHTML = '';
    }
    populateStartNicheSelect();
    document.getElementById('config-modal').classList.add('show');
}

function clearData() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.')) {
        clearAllData();
        showToast('Dati cancellati con successo', 'success');
    }
}

// Feedback Modal Functions
function openFeedbackModal() {
    document.getElementById('feedback-modal').classList.add('show');
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('show');
}

document.getElementById('feedback-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    userFeedback.problems = document.getElementById('feedback-problems').value;
    userFeedback.suggestions = document.getElementById('feedback-suggestions').value;
    
    closeFeedbackModal();
    actuallyGenerateReport();
});

// Report generation
async function generateReport() {
    // First show feedback modal
    openFeedbackModal();
}

async function actuallyGenerateReport() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    let y = 20;
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORT VERIFICA APPRESTAMENTI TECNOLOGICI', 105, y, { align: 'center' });
    y += 15;
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Data Report: ${new Date().toLocaleString('it-IT')}`, 20, y);
    y += 10;
    
    // Only count completed items
    const verifiedItems = checklistData.filter(i => i.completed);
    pdf.text(`Nicchie Verificate: ${verifiedItems.length}`, 20, y);
    y += 15;
    
    // Summary
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('RIEPILOGO', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    const problematicItems = verifiedItems.filter(item => {
        for (const type of item.types) {
            const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
            if (item.checks[`${prefix}_stato`] === 'non_funzionante' ||
                item.checks[`${prefix}_sigillo`] === 'manomesso' ||
                item.checks[`${prefix}_segnaletica`] === 'assente') {
                return true;
            }
        }
        return false;
    });
    
    pdf.text(`Nicchie con problemi: ${problematicItems.length}`, 20, y);
    y += 10;
    
    // Add feedback if provided
    if (userFeedback.problems || userFeedback.suggestions) {
        y += 5;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('FEEDBACK OPERATORE', 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        if (userFeedback.problems) {
            pdf.setFont(undefined, 'bold');
            pdf.text('Problemi riscontrati:', 20, y);
            y += 5;
            pdf.setFont(undefined, 'normal');
            const problemLines = pdf.splitTextToSize(userFeedback.problems, 170);
            problemLines.forEach(line => {
                if (y > 280) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, 25, y);
                y += 5;
            });
            y += 3;
        }
        
        if (userFeedback.suggestions) {
            if (y > 260) {
                pdf.addPage();
                y = 20;
            }
            pdf.setFont(undefined, 'bold');
            pdf.text('Suggerimenti per miglioramenti:', 20, y);
            y += 5;
            pdf.setFont(undefined, 'normal');
            const suggestionLines = pdf.splitTextToSize(userFeedback.suggestions, 170);
            suggestionLines.forEach(line => {
                if (y > 280) {
                    pdf.addPage();
                    y = 20;
                }
                pdf.text(line, 25, y);
                y += 5;
            });
        }
    }
    
    // Only include verified niches
    if (verifiedItems.length > 0) {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        
        y += 10;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('DETTAGLIO VERIFICHE', 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        for (const item of verifiedItems) {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            pdf.text(`Km ${item.km} - Binario ${item.binario}`, 20, y);
            y += 5;
            
            pdf.setFont(undefined, 'normal');
            const typesLabel = item.types.map(t => {
                if (t === 'idrante') return 'Idrante VVF';
                if (t === 'tem') return 'TEM';
                return 'Quadro VVF';
            }).join(', ');
            pdf.text(`Apprestamenti: ${typesLabel}`, 25, y);
            y += 5;
            
            // Details for each tech type
            for (const type of item.types) {
                const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
                const label = type === 'idrante' ? 'Idrante VVF' : (type === 'tem' ? 'TEM' : 'Quadro VVF');
                
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                
                pdf.text(`  ${label}:`, 30, y);
                y += 5;
                pdf.text(`    - Stato: ${item.checks[`${prefix}_stato`] === 'funzionante' ? 'Funzionante' : 'Non Funzionante'}`, 30, y);
                y += 5;
                pdf.text(`    - Sigillo: ${item.checks[`${prefix}_sigillo`] === 'integro' ? 'Integro' : 'Manomesso'}`, 30, y);
                y += 5;
                pdf.text(`    - Segnaletica: ${item.checks[`${prefix}_segnaletica`] === 'presente' ? 'Presente' : 'Assente'}`, 30, y);
                y += 5;
                
                // Add photos for this check type if present
                const photoTypes = [`${prefix}_stato`, `${prefix}_sigillo`, `${prefix}_segnaletica`];
                for (const photoType of photoTypes) {
                    const photos = item.photosByType[photoType] || [];
                    if (photos.length > 0) {
                        const checkName = photoType.split('_').pop();
                        pdf.text(`    - Foto ${checkName}: ${photos.length} allegata/e`, 30, y);
                        y += 5;
                        
                        // Add photos to PDF
                        for (let i = 0; i < photos.length; i++) {
                            if (y > 200) {
                                pdf.addPage();
                                y = 20;
                            }
                            
                            try {
                                const imgData = photos[i];
                                const imgWidth = 80;
                                const imgHeight = 60;
                                pdf.addImage(imgData, 'JPEG', 30, y, imgWidth, imgHeight);
                                y += imgHeight + 5;
                            } catch (error) {
                                console.error('Error adding image to PDF:', error);
                                pdf.text(`      [Errore caricamento immagine ${i + 1}]`, 30, y);
                                y += 5;
                            }
                        }
                    }
                }
            }
            
            y += 5;
        }
    } else {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        y += 10;
        pdf.setFontSize(12);
        pdf.text('Nessuna nicchia verificata', 20, y);
    }
    
    // Malfunctions
    if (malfunctions.length > 0) {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        
        y += 10;
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('SEGNALAZIONI MALFUNZIONAMENTI', 20, y);
        y += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        for (const m of malfunctions) {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            const typeLabel = m.type === 'camminamento' ? 'Camminamento' : 
                             (m.type === 'corrimano' ? 'Corrimano' : 'Impianto Illuminazione');
            pdf.text(`Tipo: ${typeLabel}`, 20, y);
            y += 5;
            
            pdf.setFont(undefined, 'normal');
            pdf.text(`Progressiva: ${m.km}`, 25, y);
            y += 5;
            
            if (m.illuminazioneFaultType) {
                const faultLabel = m.illuminazioneFaultType === 'fungo_blu' ? 'Fungo Blu' : 'Corpi Illuminanti';
                pdf.text(`Tipo guasto: ${faultLabel}`, 25, y);
                y += 5;
                
                if (m.corpiCount) {
                    pdf.text(`Corpi non funzionanti: ${m.corpiCount}`, 25, y);
                    y += 5;
                }
            }
            
            if (m.notes) {
                const lines = pdf.splitTextToSize(`Note: ${m.notes}`, 170);
                lines.forEach(line => {
                    if (y > 280) {
                        pdf.addPage();
                        y = 20;
                    }
                    pdf.text(line, 25, y);
                    y += 5;
                });
            }
            
            pdf.text(`Data: ${new Date(m.timestamp).toLocaleString('it-IT')}`, 25, y);
            y += 5;
            
            // Add malfunction photo
            if (m.photo) {
                if (y > 200) {
                    pdf.addPage();
                    y = 20;
                }
                
                try {
                    const imgWidth = 80;
                    const imgHeight = 60;
                    pdf.addImage(m.photo, 'JPEG', 25, y, imgWidth, imgHeight);
                    y += imgHeight + 10;
                } catch (error) {
                    console.error('Error adding malfunction photo to PDF:', error);
                    pdf.text('[Errore caricamento foto]', 25, y);
                    y += 10;
                }
            }
        }
    }
    
    // Save PDF
    pdf.save(`report_apprestamenti_${new Date().toISOString().split('T')[0]}.pdf`);
    
    showToast('Report PDF generato con successo', 'success');
    
    // Clear all data after PDF generation
    setTimeout(() => {
        clearAllData();
    }, 3000); // Wait 3 seconds to allow user to see success message
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
