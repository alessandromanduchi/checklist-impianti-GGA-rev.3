// State
let checklistData = [];
let malfunctions = [];
let genericPhotos = []; // Store generic photos with descriptions
let visibleNicheCount = 10; // Pagination: show 10 niches at a time
let startNiche = null; // Starting niche for verification
let direction = null; // Direction of verification
let sortedNicheIndices = []; // Store sorted indices based on config
let userFeedback = { problems: '', suggestions: '' }; // Store user feedback
let currentFilter = 'all'; // Equipment type filter: 'all', 'tem', 'idrante', 'quadro_vvf'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Clear all data on page reload - fresh start every time
    localStorage.removeItem('checklistData');
    localStorage.removeItem('verificationConfig');
    localStorage.removeItem('malfunctions');
    localStorage.removeItem('genericPhotos');
    
    // Always start with config modal
    document.getElementById('config-modal').classList.add('show');
    
    populateAllNichesSelect();
    registerServiceWorker();
});

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/checklist-impianti-GGA-rev.3-copilot-add-nicchia-verifica-report/service-worker.js', {
            scope: '/checklist-impianti-GGA-rev.3-copilot-add-nicchia-verifica-report/'
        })
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Configuration Modal - simplified to only direction
document.getElementById('config-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedDirection = document.getElementById('direction').value;
    
    // No longer need startNiche - will start from beginning of sorted list
    startNiche = null;
    direction = selectedDirection;
    
    // Save configuration
    localStorage.setItem('verificationConfig', JSON.stringify({
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
    
    // Sort niches based on direction only
    if (direction !== null) {
        // Parse km values for sorting
        const parseKm = (km) => {
            const parts = km.split('+');
            return parseFloat(parts[0]) + parseFloat(parts[1]) / 1000;
        };
        
        // Create sorted indices array
        const indices = TECH_NICHES_DATA.map((_, idx) => idx);
        
        if (direction === 'vernio') {
            // Sort ASCENDING (towards Vernio 37+259 is lower km)
            // Start from 37+259 and go up to 55+742
            indices.sort((a, b) => {
                const kmA = parseKm(TECH_NICHES_DATA[a].km);
                const kmB = parseKm(TECH_NICHES_DATA[b].km);
                return kmA - kmB; // Ascending order
            });
        } else {
            // Sort DESCENDING (from San Benedetto 55+742 down to 37+259)
            indices.sort((a, b) => {
                const kmA = parseKm(TECH_NICHES_DATA[a].km);
                const kmB = parseKm(TECH_NICHES_DATA[b].km);
                return kmB - kmA; // Descending order
            });
        }
        
        sortedNicheIndices = indices;
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
            timestamp: null,
            displayIndex: displayIndex
        };
        
        // Initialize checks based on tech types
        niche.types.forEach(type => {
            if (type === 'idrante') {
                item.checks.idrante_stato = null;
                item.checks.idrante_sigillo = null;
                item.checks.idrante_segnaletica = null;
            }
            if (type === 'tem') {
                item.checks.tem_stato = null;
                // TEM does not require seal verification
                item.checks.tem_segnaletica = null;
            }
            if (type === 'quadro_vvf') {
                item.checks.quadro_stato = null;
                item.checks.quadro_sigillo = null;
                item.checks.quadro_segnaletica = null;
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
    visibleNicheCount = Math.min(visibleNicheCount + 10, checklistData.length);
    renderFilteredChecklist();
}

function updatePaginationButton() {
    const container = document.getElementById('pagination-container');
    const filteredItems = getFilteredItems();
    const visibleFiltered = filteredItems.filter(item => item.displayIndex < visibleNicheCount);
    
    if (visibleFiltered.length < filteredItems.length) {
        container.style.display = 'block';
        const remaining = filteredItems.length - visibleFiltered.length;
        const toShow = Math.min(10, remaining);
        container.querySelector('button').textContent = `Mostra altre ${toShow}`;
    } else {
        container.style.display = 'none';
    }
}

// Filter Modal Functions
function openFilterModal() {
    document.getElementById('filter-modal').classList.add('show');
}

function closeFilterModal() {
    document.getElementById('filter-modal').classList.remove('show');
}

// Filter by equipment type
function filterByType(type) {
    currentFilter = type;
    
    // Update button states in filter modal
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${type}"]`).classList.add('active');
    
    // Re-render checklist with filter
    renderFilteredChecklist();
    
    // Close filter modal
    closeFilterModal();
}

function getFilteredItems() {
    if (currentFilter === 'all') {
        return checklistData;
    }
    
    return checklistData.filter(item => item.types.includes(currentFilter));
}

function renderFilteredChecklist() {
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';
    
    const filteredItems = getFilteredItems();
    const itemsToShow = filteredItems.filter(item => item.displayIndex < visibleNicheCount);
    
    itemsToShow.forEach(item => {
        const itemEl = createChecklistItem(item, item.displayIndex);
        checklist.appendChild(itemEl);
        
        // Restore state if item was already filled
        Object.keys(item.checks).forEach(checkType => {
            if (item.checks[checkType]) {
                const radio = document.querySelector(`input[name="${checkType}-${item.id}"][value="${item.checks[checkType]}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }
        });
        
        // Display photos
        
        if (item.completed) {
            itemEl.classList.add('completed');
        }
        
        updateMeta(item.id);
    });
    
    updatePaginationButton();
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
                </div>`;
        
        // Only show seal check for non-TEM equipment
        if (type !== 'tem') {
            checksHTML += `
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
                </div>`;
        }
        
        checksHTML += `
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

function updateItemCompletion(itemId) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    let allChecked = true;
    let hasProblems = false;
    let hasAnyCheck = false; // Track if at least one check is done
    
    // Check all required checks
    for (const type of item.types) {
        const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
        
        // Check if any check is done for this type
        if (item.checks[`${prefix}_stato`] || 
            (type !== 'tem' && item.checks[`${prefix}_sigillo`]) ||
            item.checks[`${prefix}_segnaletica`]) {
            hasAnyCheck = true;
        }
        
        // For TEM, we don't check sigillo
        if (type === 'tem') {
            if (!item.checks[`${prefix}_stato`] || 
                !item.checks[`${prefix}_segnaletica`]) {
                allChecked = false;
            }
        } else {
            if (!item.checks[`${prefix}_stato`] || 
                !item.checks[`${prefix}_sigillo`] || 
                !item.checks[`${prefix}_segnaletica`]) {
                allChecked = false;
            }
        }
        
        // Flag as problematic if ANY check reveals an issue (consistent with PDF report logic)
        if (item.checks[`${prefix}_stato`] === 'non_funzionante') hasProblems = true;
        if (type !== 'tem' && item.checks[`${prefix}_sigillo`] === 'manomesso') hasProblems = true;
        if (item.checks[`${prefix}_segnaletica`] === 'assente') hasProblems = true;
    }
    
    // NEW LOGIC: Mark as verified if at least one check is done
    const isFullyComplete = allChecked; // All checks are done
    item.completed = hasAnyCheck; // Verified if ANY check is done
    item.isFullyComplete = isFullyComplete; // Track if ALL checks are done
    item.hasProblems = hasProblems;
    item.isPartial = hasAnyCheck && !isFullyComplete; // Partial if some checks done but not all
    
    if (item.completed && !item.timestamp) {
        item.timestamp = new Date().toISOString();
    }
    
    updateMeta(itemId);
    updateProgress();
    
    const itemEl = document.getElementById(`item-${itemId}`);
    if (item.completed) {
        itemEl.classList.add('completed');
        // Remove all state classes first
        itemEl.classList.remove('problematic', 'partial');
        
        // Apply appropriate state class based on priority:
        // 1. Partial (yellow) - has incomplete checks
        // 2. Problematic (red) - fully complete but has problems
        // 3. Default (green) - fully complete and no problems
        if (item.isPartial) {
            itemEl.classList.add('partial');
        } else if (item.hasProblems) {
            itemEl.classList.add('problematic');
        }
    } else {
        itemEl.classList.remove('completed', 'problematic', 'partial');
    }
}

function updateMeta(itemId) {
    const item = checklistData.find(i => i.id === itemId);
    if (!item) return;
    
    const metaEl = document.getElementById(`meta-${itemId}`);
    if (!metaEl) return;
    
    if (item.completed) {
        const date = new Date(item.timestamp);
        // Determine color based on state: yellow for partial, red for problems, green for complete
        let color;
        if (item.isPartial) {
            color = '#f59e0b'; // Yellow/amber color for partial
        } else if (item.hasProblems) {
            color = 'var(--danger)'; // Red for problems
        } else {
            color = 'var(--accent)'; // Green for complete and functional
        }
        metaEl.innerHTML = `
            <span style="color: ${color}">Verificata</span>
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
    const camminamentoStatusGroup = document.getElementById('camminamento-status-group');
    const illuminazioneFaultTypeGroup = document.getElementById('illuminazione-fault-type-group');
    const illuminazioneFunghiGroup = document.getElementById('illuminazione-funghi-group');
    const illuminazioneCorpiGroup = document.getElementById('illuminazione-corpi-group');
    const qeRiferimentoGroup = document.getElementById('qe-riferimento-group');
    const ramoRiferimentoGroup = document.getElementById('ramo-riferimento-group');
    
    // Hide all type-specific fields initially
    if (camminamentoStatusGroup) camminamentoStatusGroup.style.display = 'none';
    if (illuminazioneFaultTypeGroup) illuminazioneFaultTypeGroup.style.display = 'none';
    if (illuminazioneFunghiGroup) illuminazioneFunghiGroup.style.display = 'none';
    if (illuminazioneCorpiGroup) illuminazioneCorpiGroup.style.display = 'none';
    if (qeRiferimentoGroup) qeRiferimentoGroup.style.display = 'none';
    if (ramoRiferimentoGroup) ramoRiferimentoGroup.style.display = 'none';
    
    // Show type-specific fields based on selected type
    if (type === 'camminamento_corrimano') {
        camminamentoStatusGroup.style.display = 'block';
    } else if (type === 'illuminazione') {
        illuminazioneFaultTypeGroup.style.display = 'block';
        qeRiferimentoGroup.style.display = 'block';
        
        // Populate QE di riferimento dropdown if not already populated
        const qeSelect = document.getElementById('qe-riferimento');
        if (qeSelect.options.length === 1) { // Only has the default "Seleziona QE..." option
            populateQESelect('qe-riferimento');
        }
    }
    // For segnaletica and altro, no additional fields needed
}

function updateRamoDiRiferimento() {
    const qeValue = document.getElementById('qe-riferimento').value;
    const ramoRiferimentoGroup = document.getElementById('ramo-riferimento-group');
    const kmGroup = document.querySelector('#malfunction-km').closest('.form-group');
    const kmSelect = document.getElementById('malfunction-km');
    
    if (qeValue) {
        // Show Ramo di riferimento and hide Progressiva Chilometrica
        ramoRiferimentoGroup.style.display = 'block';
        kmGroup.style.display = 'none';
        kmSelect.removeAttribute('required');
    } else {
        // Hide Ramo di riferimento and show Progressiva Chilometrica
        ramoRiferimentoGroup.style.display = 'none';
        kmGroup.style.display = 'block';
        kmSelect.setAttribute('required', 'required');
    }
}

function updateIlluminazioneFaultType() {
    const faultType = document.getElementById('illuminazione-fault-type').value;
    const funghiGroup = document.getElementById('illuminazione-funghi-group');
    const corpiGroup = document.getElementById('illuminazione-corpi-group');
    const funghiInput = document.getElementById('illuminazione-funghi-count');
    const corpiSelect = document.getElementById('illuminazione-corpi-count');
    
    // Hide both count fields initially
    if (funghiGroup) funghiGroup.style.display = 'none';
    if (corpiGroup) corpiGroup.style.display = 'none';
    
    // Clear values when switching types
    if (funghiInput) funghiInput.value = '';
    if (corpiSelect) corpiSelect.value = '';
    
    // Show appropriate count field based on fault type
    if (faultType === 'fungo_blu') {
        funghiGroup.style.display = 'block';
        funghiInput.setAttribute('required', 'required');
        corpiSelect.removeAttribute('required');
    } else if (faultType === 'corpi_illuminanti') {
        corpiGroup.style.display = 'block';
        corpiSelect.setAttribute('required', 'required');
        funghiInput.removeAttribute('required');
    }
}


// Note: illuminazione-fault-type change is handled by updateIlluminazioneFaultType() via onchange attribute

function populateAllNichesSelect(selectId = 'malfunction-km') {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleziona nicchia...</option>';
    
    ALL_NICHES_DATA.forEach(niche => {
        const option = document.createElement('option');
        option.value = `${niche.km}-${niche.binario}`;
        option.textContent = `${niche.km} - Binario ${niche.binario}`;
        select.appendChild(option);
    });
}

function populateQESelect(selectId) {
    const qeSelect = document.getElementById(selectId);
    if (!qeSelect || qeSelect.options.length > 1) return; // Already populated
    const qeList = [
        { num: 1, km: "37+234", binario: "D" },
        { num: 2, km: "37+200", binario: "P" },
        { num: 3, km: "37+435", binario: "D" },
        { num: 4, km: "37+413", binario: "P" },
        { num: 5, km: "37+688", binario: "D" },
        { num: 6, km: "37+663", binario: "P" },
        { num: 7, km: "37+988", binario: "D" },
        { num: 8, km: "37+913", binario: "P" },
        { num: 9, km: "38+238", binario: "D" },
        { num: 10, km: "38+163", binario: "P" },
        { num: 11, km: "38+488", binario: "D" },
        { num: 12, km: "38+413", binario: "P" },
        { num: 13, km: "38+738", binario: "D" },
        { num: 14, km: "38+663", binario: "P" },
        { num: 15, km: "38+989", binario: "D" },
        { num: 16, km: "38+863", binario: "P" },
        { num: 17, km: "39+238", binario: "D" },
        { num: 18, km: "39+113", binario: "P" },
        { num: 19, km: "39+488", binario: "D" },
        { num: 20, km: "39+313", binario: "P" },
        { num: 21, km: "39+788", binario: "D" },
        { num: 22, km: "39+563", binario: "P" },
        { num: 23, km: "40+038", binario: "D" },
        { num: 24, km: "39+763", binario: "P" },
        { num: 25, km: "40+288", binario: "D" },
        { num: 26, km: "40+013", binario: "P" },
        { num: 27, km: "40+538", binario: "D" },
        { num: 28, km: "40+263", binario: "P" },
        { num: 29, km: "40+732", binario: "D" },
        { num: 30, km: "40+513", binario: "P" },
        { num: 31, km: "40+988", binario: "D" },
        { num: 32, km: "40+763", binario: "P" },
        { num: 33, km: "41+232", binario: "D" },
        { num: 34, km: "41+013", binario: "P" },
        { num: 35, km: "41+535", binario: "D" },
        { num: 36, km: "41+259", binario: "P" },
        { num: 37, km: "41+836", binario: "D" },
        { num: 38, km: "41+513", binario: "P" },
        { num: 39, km: "42+138", binario: "D" },
        { num: 40, km: "41+763", binario: "P" },
        { num: 41, km: "42+388", binario: "D" },
        { num: 42, km: "42+063", binario: "P" },
        { num: 43, km: "42+686", binario: "D" },
        { num: 44, km: "42+313", binario: "P" },
        { num: 45, km: "42+888", binario: "D" },
        { num: 46, km: "42+563", binario: "P" },
        { num: 47, km: "43+138", binario: "D" },
        { num: 48, km: "42+813", binario: "P" },
        { num: 49, km: "43+338", binario: "D" },
        { num: 50, km: "43+088", binario: "P" },
        { num: 51, km: "43+688", binario: "D" },
        { num: 52, km: "43+313", binario: "P" },
        { num: 53, km: "43+938", binario: "D" },
        { num: 54, km: "43+563", binario: "P" },
        { num: 55, km: "44+188", binario: "D" },
        { num: 56, km: "43+813", binario: "P" },
        { num: 57, km: "44+436", binario: "D" },
        { num: 58, km: "44+019", binario: "P" },
        { num: 59, km: "44+683", binario: "D" },
        { num: 60, km: "44+219", binario: "P" },
        { num: 61, km: "44+933", binario: "D" },
        { num: 62, km: "44+458", binario: "P" },
        { num: 63, km: "45+233", binario: "D" },
        { num: 64, km: "44+708", binario: "P" },
        { num: 65, km: "45+433", binario: "D" },
        { num: 66, km: "44+958", binario: "P" },
        { num: 67, km: "45+683", binario: "D" },
        { num: 68, km: "45+258", binario: "P" },
        { num: 69, km: "45+935", binario: "D" },
        { num: 70, km: "45+458", binario: "P" },
        { num: 71, km: "46+184", binario: "D" },
        { num: 72, km: "45+708", binario: "P" },
        { num: 73, km: "46+481", binario: "D" },
        { num: 74, km: "45+958", binario: "P" },
        { num: 75, km: "46+780", binario: "D" },
        { num: 76, km: "46+236", binario: "P" },
        { num: 77, km: "46+848", binario: "D" },
        { num: 78, km: "46+497", binario: "P" },
        { num: 79, km: "47+100", binario: "D" },
        { num: 80, km: "46+800", binario: "P" },
        { num: 81, km: "47+298", binario: "D" },
        { num: 82, km: "46+870", binario: "P" },
        { num: 83, km: "47+524", binario: "D" },
        { num: 84, km: "47+223", binario: "P" },
        { num: 85, km: "47+774", binario: "D" },
        { num: 86, km: "47+499", binario: "P" },
        { num: 87, km: "47+974", binario: "D" },
        { num: 88, km: "47+749", binario: "P" },
        { num: 89, km: "48+274", binario: "D" },
        { num: 90, km: "47+999", binario: "P" },
        { num: 91, km: "48+524", binario: "D" },
        { num: 92, km: "48+249", binario: "P" },
        { num: 93, km: "48+774", binario: "D" },
        { num: 94, km: "48+449", binario: "P" },
        { num: 95, km: "49+024", binario: "D" },
        { num: 96, km: "48+649", binario: "P" },
        { num: 97, km: "49+324", binario: "D" },
        { num: 98, km: "48+849", binario: "P" },
        { num: 99, km: "49+574", binario: "D" },
        { num: 100, km: "49+099", binario: "P" },
        { num: 101, km: "49+774", binario: "D" },
        { num: 102, km: "49+349", binario: "P" },
        { num: 103, km: "50+023", binario: "D" },
        { num: 104, km: "49+599", binario: "P" },
        { num: 105, km: "50+273", binario: "D" },
        { num: 106, km: "49+849", binario: "P" },
        { num: 107, km: "50+522", binario: "D" },
        { num: 108, km: "50+098", binario: "P" },
        { num: 109, km: "50+771", binario: "D" },
        { num: 110, km: "50+397", binario: "P" },
        { num: 111, km: "50+970", binario: "D" },
        { num: 112, km: "50+647", binario: "P" },
        { num: 113, km: "51+219", binario: "D" },
        { num: 114, km: "50+875", binario: "P" },
        { num: 115, km: "51+419", binario: "D" },
        { num: 116, km: "51+144", binario: "P" },
        { num: 117, km: "51+669", binario: "D" },
        { num: 118, km: "51+394", binario: "P" },
        { num: 119, km: "51+919", binario: "D" },
        { num: 120, km: "51+644", binario: "P" },
        { num: 121, km: "52+171", binario: "D" },
        { num: 122, km: "51+894", binario: "P" },
        { num: 123, km: "52+421", binario: "D" },
        { num: 124, km: "52+143", binario: "P" },
        { num: 125, km: "52+634", binario: "D" },
        { num: 126, km: "52+396", binario: "P" },
        { num: 127, km: "52+871", binario: "D" },
        { num: 128, km: "52+621", binario: "P" },
        { num: 129, km: "53+123", binario: "D" },
        { num: 130, km: "52+846", binario: "P" },
        { num: 131, km: "53+323", binario: "D" },
        { num: 132, km: "53+097", binario: "P" },
        { num: 133, km: "53+573", binario: "D" },
        { num: 134, km: "53+347", binario: "P" },
        { num: 135, km: "53+823", binario: "D" },
        { num: 136, km: "53+597", binario: "P" },
        { num: 137, km: "54+074", binario: "D" },
        { num: 138, km: "53+847", binario: "P" },
        { num: 139, km: "54+274", binario: "D" },
        { num: 140, km: "54+099", binario: "P" },
        { num: 141, km: "54+474", binario: "D" },
        { num: 142, km: "54+349", binario: "P" },
        { num: 143, km: "54+724", binario: "D" },
        { num: 144, km: "54+599", binario: "P" },
        { num: 145, km: "54+974", binario: "D" },
        { num: 146, km: "54+899", binario: "P" },
        { num: 147, km: "55+225", binario: "D" },
        { num: 148, km: "55+150", binario: "P" },
        { num: 149, km: "55+425", binario: "D" },
        { num: 150, km: "55+400", binario: "P" },
        { num: 151, km: "55+742", binario: "D" },
        { num: 152, km: "55+742", binario: "P" }
    ];
    qeList.forEach(qe => {
        const option = document.createElement('option');
        option.value = `QE ${qe.num} (${qe.km} - Binario ${qe.binario})`;
        option.textContent = `QE n.${qe.num} (${qe.km} - Binario ${qe.binario})`;
        qeSelect.appendChild(option);
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
    
    // FIX: Capture the file reference BEFORE any reset/close operations
    // form.reset() inside closeMalfunctionModal() would clear photoInput.files,
    // making the file unreadable. We grab a direct reference to the File object here.
    const photoFile = photoInput.files[0];
    
    const malfunction = {
        id: Date.now().toString(),
        type: type,
        km: km,
        notes: notes,
        timestamp: new Date().toISOString()
    };
    
    // Type-specific fields
    if (type === 'camminamento_corrimano') {
        const status = document.getElementById('camminamento-status').value;
        if (status) {
            malfunction.camminamentoStatus = status;
        }
    } else if (type === 'illuminazione') {
        const faultType = document.getElementById('illuminazione-fault-type').value;
        if (faultType) {
            malfunction.illuminazioneFaultType = faultType;
            
            if (faultType === 'fungo_blu') {
                const funghiCount = document.getElementById('illuminazione-funghi-count').value;
                if (funghiCount) {
                    malfunction.funghiCount = funghiCount;
                }
            } else if (faultType === 'corpi_illuminanti') {
                const corpiCount = document.getElementById('illuminazione-corpi-count').value;
                if (corpiCount) {
                    malfunction.lightCount = corpiCount;
                }
            }
        }
        
        const qeRiferimento = document.getElementById('qe-riferimento').value;
        if (qeRiferimento) {
            malfunction.qeRiferimento = qeRiferimento;
            const ramoRiferimento = document.getElementById('ramo-riferimento').value;
            if (ramoRiferimento) {
                malfunction.ramoRiferimento = ramoRiferimento;
            }
        }
    }
    
    // FIX: Read the photo FIRST using the captured File reference,
    // then close the modal INSIDE onload so the reset happens after reading.
    const reader = new FileReader();
    reader.onload = (ev) => {
        malfunction.photo = ev.target.result;
        
        // Store the MIME type so the PDF generator can use the correct format
        malfunction.photoMimeType = photoFile.type || 'image/jpeg';
        
        malfunctions.push(malfunction);
        saveMalfunctionsToLocalStorage();
        
        // FIX: Close modal AFTER photo is successfully read (prevents form.reset() from
        // clearing the file input before FileReader can access it)
        closeMalfunctionModal();
        showToast('Segnalazione salvata con successo', 'success');
    };
    reader.onerror = () => {
        showToast('Errore nella lettura della foto. Riprovare.', 'error');
    };
    reader.readAsDataURL(photoFile);
});

// LocalStorage functions
function saveToLocalStorage() {
    localStorage.setItem('checklistData', JSON.stringify(checklistData));
}

function saveMalfunctionsToLocalStorage() {
    localStorage.setItem('malfunctions', JSON.stringify(malfunctions));
}

function saveGenericPhotosToLocalStorage() {
    localStorage.setItem('genericPhotos', JSON.stringify(genericPhotos));
}

// Generic Photo / Observations Modal Functions
function openGenericPhotoModal() {
    // Populate niche dropdown with all 720 niches
    populateAllNichesSelect('generic-obs-km');
    // Populate QE dropdown if not already done
    populateQESelect('generic-obs-qe');
    // Reset form state
    updateGenericObsForm();
    document.getElementById('generic-photo-modal').classList.add('show');
}

function closeGenericPhotoModal() {
    document.getElementById('generic-photo-modal').classList.remove('show');
    document.getElementById('generic-photo-form').reset();
    updateGenericObsForm();
}

function updateGenericObsForm() {
    const type = document.getElementById('generic-obs-type').value;
    const camminamentoStatusGroup = document.getElementById('generic-obs-camminamento-status-group');
    const illuminazioneFaultTypeGroup = document.getElementById('generic-obs-illuminazione-fault-type-group');
    const funghiGroup = document.getElementById('generic-obs-funghi-group');
    const corpiGroup = document.getElementById('generic-obs-corpi-group');
    const qeGroup = document.getElementById('generic-obs-qe-group');
    const ramoGroup = document.getElementById('generic-obs-ramo-group');
    const kmGroup = document.getElementById('generic-obs-km-group');
    const kmSelect = document.getElementById('generic-obs-km');
    const funghiInput = document.getElementById('generic-obs-funghi-count');
    const corpiSelect = document.getElementById('generic-obs-corpi-count');

    // Hide all type-specific fields and remove any dynamically-added required attributes
    // so that hidden fields don't block form re-submission (e.g. on mobile Safari)
    if (camminamentoStatusGroup) camminamentoStatusGroup.style.display = 'none';
    if (illuminazioneFaultTypeGroup) illuminazioneFaultTypeGroup.style.display = 'none';
    if (funghiGroup) funghiGroup.style.display = 'none';
    if (funghiInput) funghiInput.removeAttribute('required');
    if (corpiGroup) corpiGroup.style.display = 'none';
    if (corpiSelect) corpiSelect.removeAttribute('required');
    if (qeGroup) qeGroup.style.display = 'none';
    if (ramoGroup) ramoGroup.style.display = 'none';
    if (kmGroup) kmGroup.style.display = 'none';
    if (kmSelect) kmSelect.removeAttribute('required');

    if (type === 'camminamento_corrimano') {
        if (camminamentoStatusGroup) camminamentoStatusGroup.style.display = 'block';
        if (kmGroup) kmGroup.style.display = 'block';
        if (kmSelect) kmSelect.setAttribute('required', 'required');
    } else if (type === 'illuminazione') {
        if (illuminazioneFaultTypeGroup) illuminazioneFaultTypeGroup.style.display = 'block';
        if (qeGroup) qeGroup.style.display = 'block';
        // km group visibility handled by updateGenericObsRamoDiRiferimento
        updateGenericObsRamoDiRiferimento();
        updateGenericObsIlluminazioneFaultType();
    } else if (type === 'segnaletica' || type === 'altro') {
        if (kmGroup) kmGroup.style.display = 'block';
        if (kmSelect) kmSelect.setAttribute('required', 'required');
    }
}

function updateGenericObsIlluminazioneFaultType() {
    const faultType = document.getElementById('generic-obs-illuminazione-fault-type').value;
    const funghiGroup = document.getElementById('generic-obs-funghi-group');
    const corpiGroup = document.getElementById('generic-obs-corpi-group');
    const funghiInput = document.getElementById('generic-obs-funghi-count');
    const corpiSelect = document.getElementById('generic-obs-corpi-count');

    if (funghiGroup) funghiGroup.style.display = 'none';
    if (corpiGroup) corpiGroup.style.display = 'none';
    if (funghiInput) { funghiInput.value = ''; funghiInput.removeAttribute('required'); }
    if (corpiSelect) { corpiSelect.value = ''; corpiSelect.removeAttribute('required'); }

    if (faultType === 'fungo_blu') {
        if (funghiGroup) funghiGroup.style.display = 'block';
        if (funghiInput) funghiInput.setAttribute('required', 'required');
    } else if (faultType === 'corpi_illuminanti') {
        if (corpiGroup) corpiGroup.style.display = 'block';
        if (corpiSelect) corpiSelect.setAttribute('required', 'required');
    }
}

function updateGenericObsRamoDiRiferimento() {
    const qeValue = document.getElementById('generic-obs-qe').value;
    const ramoGroup = document.getElementById('generic-obs-ramo-group');
    const kmGroup = document.getElementById('generic-obs-km-group');
    const kmSelect = document.getElementById('generic-obs-km');

    if (qeValue) {
        if (ramoGroup) ramoGroup.style.display = 'block';
        if (kmGroup) kmGroup.style.display = 'none';
        if (kmSelect) kmSelect.removeAttribute('required');
    } else {
        if (ramoGroup) ramoGroup.style.display = 'none';
        if (kmGroup) kmGroup.style.display = 'block';
        if (kmSelect) kmSelect.setAttribute('required', 'required');
    }
}

document.getElementById('generic-photo-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const type = document.getElementById('generic-obs-type').value;
    const photoInput = document.getElementById('generic-obs-photo');
    const notes = document.getElementById('generic-obs-notes').value;

    if (!photoInput.files[0]) {
        showToast('Per favore allega una foto', 'error');
        return;
    }

    const photoFile = photoInput.files[0];

    const genericPhoto = {
        id: Date.now().toString(),
        type: type,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    // Type-specific fields
    if (type === 'camminamento_corrimano') {
        const status = document.getElementById('generic-obs-camminamento-status').value;
        if (status) genericPhoto.camminamentoStatus = status;
        genericPhoto.km = document.getElementById('generic-obs-km').value;
    } else if (type === 'illuminazione') {
        const faultType = document.getElementById('generic-obs-illuminazione-fault-type').value;
        if (faultType) {
            genericPhoto.illuminazioneFaultType = faultType;
            if (faultType === 'fungo_blu') {
                const funghiCount = document.getElementById('generic-obs-funghi-count').value;
                if (funghiCount) genericPhoto.funghiCount = funghiCount;
            } else if (faultType === 'corpi_illuminanti') {
                const corpiCount = document.getElementById('generic-obs-corpi-count').value;
                if (corpiCount) genericPhoto.lightCount = corpiCount;
            }
        }
        const qeRiferimento = document.getElementById('generic-obs-qe').value;
        if (qeRiferimento) {
            genericPhoto.qeRiferimento = qeRiferimento;
            const ramoRiferimento = document.getElementById('generic-obs-ramo').value;
            if (ramoRiferimento) genericPhoto.ramoRiferimento = ramoRiferimento;
        } else {
            genericPhoto.km = document.getElementById('generic-obs-km').value;
        }
    } else {
        genericPhoto.km = document.getElementById('generic-obs-km').value;
    }

    // Close modal immediately after all form data has been captured.
    // photoFile is already held as a local reference, so the form.reset()
    // triggered by closeGenericPhotoModal() cannot interfere with the
    // FileReader that is about to read it.
    closeGenericPhotoModal();

    const reader = new FileReader();
    reader.onload = (ev) => {
        genericPhoto.photo = ev.target.result;
        genericPhoto.photoMimeType = photoFile.type || 'image/jpeg';
        genericPhotos.push(genericPhoto);
        saveGenericPhotosToLocalStorage();
        showToast('Osservazione salvata con successo', 'success');
    };
    reader.onerror = () => {
        showToast('Errore nella lettura della foto. Riprovare.', 'error');
    };
    reader.readAsDataURL(photoFile);
});

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
    
    const savedGenericPhotos = localStorage.getItem('genericPhotos');
    if (savedGenericPhotos) {
        genericPhotos = JSON.parse(savedGenericPhotos);
    }
}

// Clear all data without confirmation (used after PDF generation and on reload)
function clearAllData() {
    localStorage.removeItem('checklistData');
    localStorage.removeItem('malfunctions');
    localStorage.removeItem('genericPhotos');
    localStorage.removeItem('verificationConfig');
    checklistData = [];
    malfunctions = [];
    genericPhotos = [];
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
    document.getElementById('config-modal').classList.add('show');
}

function clearData() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata.')) {
        clearAllData();
        showToast('Dati cancellati con successo', 'success');
    }
}

// Navigation Modal Functions
function openNavigationModal() {
    const select = document.getElementById('navigation-niche-select');
    select.innerHTML = '<option value="">Seleziona una nicchia...</option>';
    
    // Show ALL niches in current sorted order
    sortedNicheIndices.forEach((originalIndex) => {
        const niche = TECH_NICHES_DATA[originalIndex];
        const option = document.createElement('option');
        option.value = originalIndex;
        option.textContent = `Km ${niche.km} - Binario ${niche.binario}`;
        select.appendChild(option);
    });
    
    document.getElementById('navigation-modal').classList.add('show');
}

function closeNavigationModal() {
    document.getElementById('navigation-modal').classList.remove('show');
}

function navigateToNiche() {
    const select = document.getElementById('navigation-niche-select');
    const selectedOriginalIndex = parseInt(select.value);
    
    if (!isNaN(selectedOriginalIndex)) {
        // Find the position of this niche in the current sorted order
        const positionInSorted = sortedNicheIndices.indexOf(selectedOriginalIndex);
        
        if (positionInSorted !== -1) {
            // Reorder the sorted indices to start from the selected niche
            sortedNicheIndices = sortedNicheIndices.slice(positionInSorted).concat(sortedNicheIndices.slice(0, positionInSorted));
            
            // Reset visible count and re-initialize
            visibleNicheCount = 10;
            
            // Re-initialize checklist with new order
            const checklist = document.getElementById('checklist');
            checklist.innerHTML = '';
            checklistData = [];
            
            // Rebuild checklist data with new order
            sortedNicheIndices.forEach((originalIndex, displayIndex) => {
                const niche = TECH_NICHES_DATA[originalIndex];
                const item = {
                    id: `${niche.km}-${niche.binario}`,
                    km: niche.km,
                    binario: niche.binario,
                    types: niche.types,
                    completed: false,
                    checks: {},
                    timestamp: null,
                    displayIndex: displayIndex
                };
                
                // Initialize checks based on tech types
                niche.types.forEach(type => {
                    if (type === 'idrante') {
                        item.checks.idrante_stato = null;
                        item.checks.idrante_sigillo = null;
                        item.checks.idrante_segnaletica = null;
                    }
                    if (type === 'tem') {
                        item.checks.tem_stato = null;
                        item.checks.tem_segnaletica = null;
                    }
                    if (type === 'quadro_vvf') {
                        item.checks.quadro_stato = null;
                        item.checks.quadro_sigillo = null;
                        item.checks.quadro_segnaletica = null;
                    }
                });
                
                checklistData.push(item);
            });
            
            // Re-render with filter
            renderFilteredChecklist();
            
            // Close modal and scroll to top
            closeNavigationModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            showToast(`Verifica iniziata da Km ${TECH_NICHES_DATA[selectedOriginalIndex].km}`, 'success');
        }
    }
}

// Operator Modal Functions
let operatorInfo = {
    firstName: '',
    lastName: '',
    sector: ''
};

function openOperatorModal() {
    // Check if any malfunction has QE di riferimento (for IG personnel)
    const hasQEReference = malfunctions.some(m => m.qeRiferimento);
    
    // Pre-fill sector with IG if QE reference exists
    const sectorSelect = document.getElementById('operator-sector');
    if (hasQEReference) {
        sectorSelect.value = 'IG';
    } else {
        sectorSelect.value = '';
    }
    
    document.getElementById('operator-modal').classList.add('show');
}

function closeOperatorModal() {
    document.getElementById('operator-modal').classList.remove('show');
}

document.getElementById('operator-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    operatorInfo.firstName = document.getElementById('operator-firstname').value.trim();
    operatorInfo.lastName = document.getElementById('operator-lastname').value.trim();
    operatorInfo.sector = document.getElementById('operator-sector').value;
    
    if (operatorInfo.firstName && operatorInfo.lastName && operatorInfo.sector) {
        closeOperatorModal();
        openFeedbackModal();
    }
});

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
    // First ask for operator name
    openOperatorModal();
}

async function actuallyGenerateReport() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    let y = 20;
    
    // Header with box
    pdf.setFillColor(15, 23, 42); // Dark background
    pdf.rect(10, 10, 190, 30, 'F');
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORT VERIFICA APPRESTAMENTI TECNOLOGICI', 105, y + 5, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text('Galleria Grande Appenino', 105, y + 12, { align: 'center' });
    y += 25;
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    y += 10;
    
    // Info box
    pdf.setDrawColor(59, 130, 246); // Blue border
    pdf.setLineWidth(0.5);
    pdf.rect(15, y, 180, 25);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('Data Report:', 20, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date().toLocaleString('it-IT'), 50, y);
    y += 6;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Operatore:', 20, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(`${operatorInfo.firstName} ${operatorInfo.lastName}`, 50, y);
    y += 6;
    
    pdf.setFont(undefined, 'bold');
    pdf.text('Settore:', 20, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(operatorInfo.sector, 50, y);
    y += 10;
    
    // Statistics section
    const verifiedItems = checklistData.filter(i => i.completed);
    const problematicItems = verifiedItems.filter(item => {
        for (const type of item.types) {
            const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
            if (item.checks[`${prefix}_stato`] === 'non_funzionante' ||
                (type !== 'tem' && item.checks[`${prefix}_sigillo`] === 'manomesso') ||
                item.checks[`${prefix}_segnaletica`] === 'assente') {
                return true;
            }
        }
        return false;
    });
    
    // Statistics boxes
    pdf.setDrawColor(34, 197, 94); // Green border
    pdf.setFillColor(220, 252, 231); // Light green
    pdf.rect(15, y, 85, 20, 'FD');
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Nicchie Verificate', 57.5, y + 7, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(verifiedItems.length.toString(), 57.5, y + 15, { align: 'center' });
    
    pdf.setDrawColor(239, 68, 68); // Red border
    pdf.setFillColor(254, 226, 226); // Light red
    pdf.rect(110, y, 85, 20, 'FD');
    pdf.setFontSize(12);
    pdf.text('Nicchie con Problemi', 152.5, y + 7, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(problematicItems.length.toString(), 152.5, y + 15, { align: 'center' });
    
    y += 25;
    
    // Separator line
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(15, y, 195, y);
    y += 10;
    
    // Add section for non-functional equipment
    const nonFunctionalItems = verifiedItems.filter(item => {
        for (const type of item.types) {
            const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
            if (item.checks[`${prefix}_stato`] === 'non_funzionante') {
                return true;
            }
        }
        return false;
    });
    
    if (nonFunctionalItems.length > 0) {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        
        // Section header with background
        pdf.setFillColor(239, 68, 68); // Red background
        pdf.rect(15, y, 180, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('[!] APPRESTAMENTI NON FUNZIONANTI', 20, y + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        y += 15;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        nonFunctionalItems.forEach(item => {
            const niche = TECH_NICHES_DATA.find(n => n.km === item.km && n.binario === item.binario);
            if (niche) {
                if (y > 275) {
                    pdf.addPage();
                    y = 20;
                }
                
                pdf.setFont(undefined, 'bold');
                pdf.text(`Km ${niche.km} - Binario ${niche.binario}`, 25, y);
                y += 5;
                pdf.setFont(undefined, 'normal');
                
                for (const type of item.types) {
                    const prefix = type === 'idrante' ? 'idrante' : (type === 'tem' ? 'tem' : 'quadro');
                    if (item.checks[`${prefix}_stato`] === 'non_funzionante') {
                        const label = type === 'idrante' ? 'Idrante VVF' : (type === 'tem' ? 'TEM' : 'Quadro VVF');
                        pdf.text(`  - ${label}: NON FUNZIONANTE`, 30, y);
                        y += 5;
                    }
                }
                y += 3;
            }
        });
        
        y += 5;
    }
    
    // Add feedback if provided
    if (userFeedback.problems || userFeedback.suggestions) {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        
        y += 5;
        // Section header with background
        pdf.setFillColor(139, 92, 246); // Purple background
        pdf.rect(15, y, 180, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('>> FEEDBACK OPERATORE', 20, y + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        y += 15;
        
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
        // Section header with background
        pdf.setFillColor(59, 130, 246); // Blue background
        pdf.rect(15, y, 180, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('[=] DETTAGLIO VERIFICHE', 20, y + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        y += 15;
        
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
                
                // Show stato (always)
                if (item.checks[`${prefix}_stato`]) {
                    pdf.text(`    - Stato: ${item.checks[`${prefix}_stato`] === 'funzionante' ? 'Funzionante' : 'Non Funzionante'}`, 30, y);
                } else {
                    pdf.setTextColor(150, 150, 150); // Gray for incomplete
                    pdf.text(`    - Stato: [Non completato]`, 30, y);
                    pdf.setTextColor(0, 0, 0); // Reset to black
                }
                y += 5;
                
                // Only show sigillo for non-TEM equipment
                if (type !== 'tem') {
                    if (item.checks[`${prefix}_sigillo`]) {
                        pdf.text(`    - Sigillo: ${item.checks[`${prefix}_sigillo`] === 'integro' ? 'Integro' : 'Manomesso'}`, 30, y);
                    } else {
                        pdf.setTextColor(150, 150, 150); // Gray for incomplete
                        pdf.text(`    - Sigillo: [Non completato]`, 30, y);
                        pdf.setTextColor(0, 0, 0); // Reset to black
                    }
                    y += 5;
                }
                
                // Show segnaletica (always)
                if (item.checks[`${prefix}_segnaletica`]) {
                    pdf.text(`    - Segnaletica: ${item.checks[`${prefix}_segnaletica`] === 'presente' ? 'Presente' : 'Assente'}`, 30, y);
                } else {
                    pdf.setTextColor(150, 150, 150); // Gray for incomplete
                    pdf.text(`    - Segnaletica: [Non completato]`, 30, y);
                    pdf.setTextColor(0, 0, 0); // Reset to black
                }
                y += 5;
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
        // Section header with background
        pdf.setFillColor(245, 158, 11); // Orange background
        pdf.rect(15, y, 180, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('[!] SEGNALAZIONI MALFUNZIONAMENTI', 20, y + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        y += 15;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        for (const m of malfunctions) {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            const typeLabel = m.type === 'camminamento_corrimano' ? 'Camminamento e corrimano' : 
                             (m.type === 'segnaletica' ? 'Segnaletica' : 
                             (m.type === 'altro' ? 'Altro' : 'Impianto di illuminazione'));
            pdf.text(`Tipo: ${typeLabel}`, 20, y);
            y += 5;
            
            pdf.setFont(undefined, 'normal');
            
            // Show camminamento status if available
            if (m.camminamentoStatus) {
                const statusLabel = m.camminamentoStatus === 'agibile' ? 'Agibile' : 'Non Agibile';
                pdf.text(`Stato: ${statusLabel}`, 25, y);
                y += 5;
            }
            
            // Show illuminazione fault type and counts if available
            if (m.illuminazioneFaultType) {
                const faultTypeLabel = m.illuminazioneFaultType === 'fungo_blu' ? 'Fungo Blu' : 'Corpi Illuminanti';
                pdf.text(`Tipo guasto: ${faultTypeLabel}`, 25, y);
                y += 5;
                
                // Show appropriate count
                if (m.funghiCount) {
                    pdf.text(`Funghi blu non funzionanti: ${m.funghiCount}`, 25, y);
                    y += 5;
                } else if (m.lightCount) {
                    pdf.text(`Corpi illuminanti non funzionanti: ${m.lightCount}`, 25, y);
                    y += 5;
                }
            }
            
            // Show QE di riferimento if available (for illuminazione), otherwise show Progressiva
            if (m.qeRiferimento) {
                pdf.text(`QE di riferimento: ${m.qeRiferimento}`, 25, y);
                y += 5;
                
                // Show Ramo di riferimento if available
                if (m.ramoRiferimento) {
                    const ramoLabel = m.ramoRiferimento === 'destro' ? 'Destro' : 'Sinistro';
                    pdf.text(`Ramo di riferimento: ${ramoLabel}`, 25, y);
                    y += 5;
                }
            } else if (m.km) {
                pdf.text(`Progressiva: ${m.km}`, 25, y);
                y += 5;
            }
            
            if (m.notes) {
                const lines = pdf.splitTextToSize(`Descrizione: ${m.notes}`, 170);
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
                    // FIX: detect image format from data-URL instead of hardcoding JPEG
                    // data-URL format: data:[<mimeType>];base64,<data>
                    let imgFormat = 'JPEG';
                    if (m.photo.startsWith('data:image/png')) {
                        imgFormat = 'PNG';
                    } else if (m.photo.startsWith('data:image/webp')) {
                        imgFormat = 'WEBP';
                    } else if (m.photo.startsWith('data:image/gif')) {
                        imgFormat = 'GIF';
                    }
                    pdf.addImage(m.photo, imgFormat, 25, y, imgWidth, imgHeight);
                    y += imgHeight + 10;
                } catch (error) {
                    console.error('Error adding malfunction photo to PDF:', error);
                    pdf.text('[Errore caricamento foto]', 25, y);
                    y += 10;
                }
            }
        }
    }
    
    // Generic Photos Section
    if (genericPhotos.length > 0) {
        if (y > 250) {
            pdf.addPage();
            y = 20;
        }
        
        y += 10;
        // Section header with background
        pdf.setFillColor(34, 197, 94); // Green background
        pdf.rect(15, y, 180, 10, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('[*] Verifica altri impianti', 20, y + 7);
        pdf.setTextColor(0, 0, 0); // Reset to black
        y += 15;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        for (const gp of genericPhotos) {
            if (y > 270) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFont(undefined, 'bold');
            const gpTypeLabel = gp.type === 'camminamento_corrimano' ? 'Camminamento e corrimano' :
                               (gp.type === 'illuminazione' ? 'Impianto di illuminazione' :
                               (gp.type === 'segnaletica' ? 'Segnaletica' :
                               (gp.type === 'altro' ? 'Altro' : (gp.location ? gp.location : ''))));
            pdf.text(`Tipo: ${gpTypeLabel}`, 20, y);
            y += 5;
            
            pdf.setFont(undefined, 'normal');
            
            // Show camminamento status if available
            if (gp.camminamentoStatus) {
                const statusLabel = gp.camminamentoStatus === 'agibile' ? 'Agibile' : 'Non Agibile';
                pdf.text(`Stato: ${statusLabel}`, 25, y);
                y += 5;
            }
            
            // Show illuminazione fault type and counts if available
            if (gp.illuminazioneFaultType) {
                const faultTypeLabel = gp.illuminazioneFaultType === 'fungo_blu' ? 'Fungo Blu' : 'Corpi Illuminanti';
                pdf.text(`Tipo guasto: ${faultTypeLabel}`, 25, y);
                y += 5;
                if (gp.funghiCount) {
                    pdf.text(`Funghi blu non funzionanti: ${gp.funghiCount}`, 25, y);
                    y += 5;
                } else if (gp.lightCount) {
                    pdf.text(`Corpi illuminanti non funzionanti: ${gp.lightCount}`, 25, y);
                    y += 5;
                }
            }
            
            // Show QE di riferimento if available, otherwise show nicchia
            if (gp.qeRiferimento) {
                pdf.text(`QE di riferimento: ${gp.qeRiferimento}`, 25, y);
                y += 5;
                if (gp.ramoRiferimento) {
                    const ramoLabel = gp.ramoRiferimento === 'destro' ? 'Destro' : 'Sinistro';
                    pdf.text(`Ramo di riferimento: ${ramoLabel}`, 25, y);
                    y += 5;
                }
            } else if (gp.km) {
                pdf.text(`Progressiva: ${gp.km}`, 25, y);
                y += 5;
            }
            
            pdf.text(`Data: ${new Date(gp.timestamp).toLocaleString('it-IT')}`, 25, y);
            y += 5;
            
            // Description with text wrapping
            const descField = gp.notes !== undefined ? gp.notes : gp.description;
            if (descField) {
                const descriptionLines = pdf.splitTextToSize(`Descrizione: ${descField}`, 170);
                descriptionLines.forEach(line => {
                    if (y > 280) {
                        pdf.addPage();
                        y = 20;
                    }
                    pdf.text(line, 25, y);
                    y += 5;
                });
            }
            
            // Add photo
            if (gp.photo) {
                if (y > 200) {
                    pdf.addPage();
                    y = 20;
                }
                
                try {
                    const imgWidth = 80;
                    const imgHeight = 60;
                    // FIX: detect image format from data-URL
                    let imgFormat = 'JPEG';
                    if (gp.photo.startsWith('data:image/png')) {
                        imgFormat = 'PNG';
                    } else if (gp.photo.startsWith('data:image/webp')) {
                        imgFormat = 'WEBP';
                    } else if (gp.photo.startsWith('data:image/gif')) {
                        imgFormat = 'GIF';
                    }
                    pdf.addImage(gp.photo, imgFormat, 25, y, imgWidth, imgHeight);
                    y += imgHeight + 10;
                } catch (error) {
                    console.error('Error adding generic photo to PDF:', error);
                    pdf.text('[Errore caricamento foto]', 25, y);
                    y += 10;
                }
            }
            
            y += 5;
        }
    }
    
    // Save PDF
    pdf.save(`report_apprestamenti_${new Date().toISOString().split('T')[0]}.pdf`);
    
    showToast('Report PDF generato con successo', 'success');
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
