(function () {
  'use strict';

  var DRAG_ACTIVATE_PX = 2;
  var SUCCESS_MS = 2200;
  var SHAKE_MS = 800;
  var FEEDBACK_MS = 1500;
  var MOVES_HINT_AT = 10;

  /** Spread chips across the pool (percent), leaving room for the bottom bar */
  function scatterLayout(index, total) {
    var cols = total <= 5 ? 3 : 4;
    var rows = Math.ceil(total / cols);
    var col = index % cols;
    var row = Math.floor(index / cols);
    var leftPad = 4;
    var topPad = 5;
    var width = 92;
    var height = 88;
    var left = leftPad + ((col + 0.5) / cols) * width;
    var top = topPad + ((row + 0.5) / rows) * height;
    if (row % 2 === 1) {
      left += (width / cols) * 0.12;
    }
    return {
      left: Math.round(Math.min(93, Math.max(3, left))),
      top: Math.round(Math.min(90, Math.max(4, top)))
    };
  }

  var THEMES = {
    results: {
      mode: 'makeNumber',
      modifier: 'hero-play--results',
      hint: 'Pop the target score!',
      targetPool: [18, 20, 24, 30],
      numberPool: [2, 3, 4, 5, 6, 8],
      operators: ['+', '×'],
      toasts: ['Target smashed!', 'Math muscle!', 'Brilliant!']
    },
    oneonone: {
      mode: 'balance',
      modifier: 'hero-play--oneonone',
      hint: 'Balance the scales — 1:1 means equal!',
      totalPool: [10, 12, 14, 16],
      toasts: ['Perfect balance!', 'Equal split!', 'Brilliant!']
    }
  };

  var root = document.querySelector('[data-hero-play]');
  if (!root) return;

  var stage = root.querySelector('[data-hero-play-stage]');
  var slotsEl = root.querySelector('[data-hero-play-slots]');
  var poolEl = root.querySelector('[data-hero-play-pool]');
  var equationEl = root.querySelector('[data-hero-play-equation]');
  var balanceEl = root.querySelector('[data-hero-play-balance]');
  var panLEl = root.querySelector('[data-hero-play-pan-l]');
  var panREl = root.querySelector('[data-hero-play-pan-r]');
  var totalEl = root.querySelector('[data-hero-play-total]');
  var scaleEl = root.querySelector('[data-hero-play-scale]');
  var hintEl = root.querySelector('[data-hero-play-hint]');
  var targetEl = root.querySelector('[data-hero-play-target]');
  var bubbleEl = root.querySelector('[data-hero-play-bubble]');
  var feedbackEl = root.querySelector('[data-hero-play-feedback]');
  var staticEl = root.querySelector('[data-hero-play-static]');
  var toastEl = root.querySelector('[data-hero-play-toast]');
  var subhintEl = root.querySelector('[data-hero-play-subhint]');
  var undoBtn = root.querySelector('[data-hero-play-undo]');
  var clearBtn = root.querySelector('[data-hero-play-clear]');

  if (!stage || !poolEl) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentTheme = 'results';
  var currentMode = 'makeNumber';
  var currentTarget = 24;
  var dragState = null;
  var chips = [];
  var slots = [];
  var successTimer = null;
  var shakeTimer = null;
  var feedbackTimer = null;
  var moveCount = 0;
  var toastIndex = 0;
  var lastTarget = null;
  var dropTargetSlot = null;
  var moveStack = [];
  var dragRafId = null;

  function getTheme(name) {
    return THEMES[name] || THEMES.results;
  }

  function isBalanceMode() {
    return currentMode === 'balance';
  }

  function evalCombo(a, op, b) {
    if (op === '+') return a + b;
    if (op === '×') return a * b;
    return NaN;
  }

  function findSolution(target, numbers, operators) {
    var i;
    var j;
    var k;
    for (i = 0; i < numbers.length; i++) {
      for (j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        for (k = 0; k < operators.length; k++) {
          if (evalCombo(numbers[i], operators[k], numbers[j]) === target) {
            return { a: numbers[i], op: operators[k], b: numbers[j] };
          }
        }
      }
    }
    return null;
  }

  function pickFromPool(pool) {
    var list = pool.slice();
    if (list.length > 1 && lastTarget !== null) {
      list = list.filter(function (t) {
        return t !== lastTarget;
      });
    }
    var value = list[Math.floor(Math.random() * list.length)];
    lastTarget = value;
    return value;
  }

  function balanceChipValues(total) {
    var half = total / 2;
    var values = [half, half];
    var decoys = [half - 1, half + 1, half + 2, half - 2];
    var i;
    for (i = 0; i < decoys.length; i++) {
      var d = decoys[i];
      if (d > 0 && d !== half && values.indexOf(d) === -1) {
        values.push(d);
      }
    }
    return values;
  }

  function setUiMode(mode) {
    var isBalance = mode === 'balance';
    root.classList.toggle('hero-play--balance', isBalance);
    if (equationEl) equationEl.hidden = isBalance;
    if (balanceEl) balanceEl.hidden = !isBalance;
  }

  function clearPlayground() {
    if (successTimer) {
      clearTimeout(successTimer);
      successTimer = null;
    }
    if (shakeTimer) {
      clearTimeout(shakeTimer);
      shakeTimer = null;
    }
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
    root.classList.remove('is-complete', 'is-pop', 'is-balanced');
    if (bubbleEl) bubbleEl.classList.remove('is-pop');
    if (balanceEl) balanceEl.classList.remove('is-tilt');
    if (toastEl) toastEl.hidden = true;
    if (slotsEl) slotsEl.innerHTML = '';
    poolEl.innerHTML = '';
    chips = [];
    slots = [];
    clearDropTarget();
    moveCount = 0;
    setFeedback('');
    clearPanDisplay();
    moveStack = [];
  }

  function clearPanDisplay() {
    if (panLEl) {
      panLEl.textContent = '?';
      panLEl.classList.remove('is-filled', 'is-wrong-flash');
    }
    if (panREl) {
      panREl.textContent = '?';
      panREl.classList.remove('is-filled', 'is-wrong-flash');
    }
  }

  function setFeedback(msg) {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.hidden = !msg;
  }

  function showFeedback(msg) {
    setFeedback(msg);
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(function () {
      updateMovesFeedback();
    }, FEEDBACK_MS);
  }

  function updateMovesFeedback() {
    if (moveCount >= MOVES_HINT_AT) {
      setFeedback('Moves: ' + moveCount);
    } else {
      setFeedback('');
    }
  }

  function buildMakeNumberSlots() {
    if (!slotsEl) return;
    var configs = [
      { id: 'slot-a', role: 'num' },
      { id: 'slot-op', role: 'op' },
      { id: 'slot-b', role: 'num' }
    ];

    configs.forEach(function (cfg, idx) {
      var el = document.createElement('span');
      el.className = 'hero-play__slot' + (cfg.role === 'op' ? ' hero-play__slot--op' : '');
      el.textContent = '?';
      el.setAttribute('data-slot-id', cfg.id);
      el.setAttribute('data-slot-role', cfg.role);
      el.setAttribute('aria-label', cfg.role === 'op' ? 'Operator slot' : 'Number slot');
      slotsEl.appendChild(el);
      slots.push({
        id: cfg.id,
        role: cfg.role,
        el: el,
        chip: null,
        index: idx
      });
    });
  }

  function buildBalanceSlots() {
    if (!panLEl || !panREl) return;
    clearPanDisplay();
    slots.push({
      id: 'pan-l',
      role: 'pan-l',
      el: panLEl,
      chip: null,
      index: 0
    });
    slots.push({
      id: 'pan-r',
      role: 'pan-r',
      el: panREl,
      chip: null,
      index: 1
    });
  }

  function createChip(kind, label, index, totalCount) {
    var pos = scatterLayout(index, totalCount || 1);
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'hero-chip hero-chip--' + kind;
    chip.textContent = label;
    chip.setAttribute('data-chip-kind', kind);
    chip.setAttribute('data-chip-value', label);
    chip.style.left = pos.left + '%';
    chip.style.top = pos.top + '%';
    chip.setAttribute('aria-label', kind === 'op' ? 'Operator ' + label : 'Number ' + label);

    poolEl.appendChild(chip);

    var chipData = {
      el: chip,
      kind: kind,
      value: kind === 'num' ? parseInt(label, 10) : label,
      homeLeft: pos.left,
      homeTop: pos.top,
      slotId: null
    };
    chips.push(chipData);

    if (!reducedMotion) {
      chip.addEventListener('pointerdown', onPointerDown);
    }

    return chipData;
  }

  function spawnMakeNumberChips(theme) {
    var total = theme.numberPool.length + theme.operators.length;
    var layoutIdx = 0;
    theme.numberPool.forEach(function (num) {
      createChip('num', String(num), layoutIdx, total);
      layoutIdx++;
    });
    theme.operators.forEach(function (op) {
      createChip('op', op, layoutIdx, total);
      layoutIdx++;
    });
  }

  function spawnBalanceChips(total) {
    var values = balanceChipValues(total);
    var count = values.length;
    values.forEach(function (num, layoutIdx) {
      createChip('num', String(num), layoutIdx, count);
    });
  }

  function fillSlot(slot, chip) {
    slot.chip = chip;
    chip.slotId = slot.id;
    slot.el.textContent = chip.el.textContent;
    slot.el.classList.add('is-filled');
    chip.el.classList.add('is-snapped');
    reparentChipToPool(chip);
    chip.el.style.visibility = 'hidden';
    chip.el.setAttribute('aria-hidden', 'true');
    moveStack.push({ chip: chip, slotId: slot.id });
  }

  function releaseChip(chip) {
    if (!chip.slotId) return;
    var slot = null;
    var i;
    for (i = 0; i < slots.length; i++) {
      if (slots[i].id === chip.slotId) {
        slot = slots[i];
        break;
      }
    }
    if (slot) {
      slot.chip = null;
      slot.el.textContent = '?';
      slot.el.classList.remove('is-filled', 'is-wrong-flash');
    }
    chip.slotId = null;
    chip.el.classList.remove('is-snapped');
    chip.el.style.visibility = '';
    chip.el.removeAttribute('aria-hidden');
  }

  function returnChipHome(chip) {
    releaseChip(chip);
    reparentChipToPool(chip);
    chip.el.style.left = chip.homeLeft + '%';
    chip.el.style.top = chip.homeTop + '%';
  }

  function clearAllSlots() {
    chips.forEach(function (chip) {
      if (chip.slotId) returnChipHome(chip);
    });
    moveStack = [];
  }

  function getSlotValues() {
    var a = null;
    var op = null;
    var b = null;
    slots.forEach(function (slot) {
      if (!slot.chip) return;
      if (slot.role === 'num' && a === null) a = slot.chip.value;
      else if (slot.role === 'op') op = slot.chip.value;
      else if (slot.role === 'num') b = slot.chip.value;
    });
    return { a: a, op: op, b: b };
  }

  function getPanValues() {
    var left = null;
    var right = null;
    slots.forEach(function (slot) {
      if (!slot.chip) return;
      if (slot.role === 'pan-l') left = slot.chip.value;
      if (slot.role === 'pan-r') right = slot.chip.value;
    });
    return { left: left, right: right };
  }

  function allSlotsFilled() {
    return slots.every(function (s) {
      return s.chip;
    });
  }

  function showStaticMakeNumber(theme, target) {
    var sol = findSolution(target, theme.numberPool, theme.operators);
    if (staticEl && sol) {
      staticEl.textContent = sol.a + ' ' + sol.op + ' ' + sol.b + ' = ' + target;
      staticEl.hidden = false;
    }
    if (stage) stage.hidden = true;
  }

  function showStaticBalance(total) {
    var half = total / 2;
    if (staticEl) {
      staticEl.textContent = half + ' + ' + half + ' = ' + total + ' (balanced)';
      staticEl.hidden = false;
    }
    if (stage) stage.hidden = true;
  }

  function loadTheme(themeName, keepTarget) {
    clearPlayground();
    currentTheme = THEMES[themeName] ? themeName : 'results';
    var theme = getTheme(currentTheme);
    currentMode = theme.mode || 'makeNumber';

    root.classList.remove('hero-play--results', 'hero-play--oneonone');
    root.classList.add(theme.modifier);
    setUiMode(currentMode);

    if (hintEl) hintEl.textContent = theme.hint;
    if (subhintEl) {
      subhintEl.textContent = isBalanceMode()
        ? 'Drag numbers onto each side of the scale.'
        : 'Drag bubbles into the dashed boxes.';
    }

    if (currentMode === 'balance') {
      if (!keepTarget) {
        currentTarget = pickFromPool(theme.totalPool);
      }
      if (totalEl) totalEl.textContent = String(currentTarget);
      if (targetEl) targetEl.textContent = String(currentTarget);

      if (reducedMotion) {
        root.classList.add('hero-play--static', 'is-complete');
        showStaticBalance(currentTarget);
        return;
      }

      root.classList.remove('hero-play--static');
      if (staticEl) staticEl.hidden = true;
      if (stage) stage.hidden = false;

      buildBalanceSlots();
      spawnBalanceChips(currentTarget);
      return;
    }

    if (!keepTarget) {
      currentTarget = pickFromPool(theme.targetPool);
    }

    if (targetEl) targetEl.textContent = String(currentTarget);

    if (reducedMotion) {
      root.classList.add('hero-play--static', 'is-complete');
      showStaticMakeNumber(theme, currentTarget);
      return;
    }

    root.classList.remove('hero-play--static');
    if (staticEl) staticEl.hidden = true;
    if (stage) stage.hidden = false;

    buildMakeNumberSlots();
    spawnMakeNumberChips(theme);
  }

  function getChipFromEl(chipEl) {
    var i;
    for (i = 0; i < chips.length; i++) {
      if (chips[i].el === chipEl) return chips[i];
    }
    return null;
  }

  function undoLastMove() {
    while (moveStack.length) {
      var last = moveStack.pop();
      if (!last || !last.chip) continue;
      var slotFound = null;
      var i;
      for (i = 0; i < slots.length; i++) {
        if (slots[i].id === last.slotId) {
          slotFound = slots[i];
          break;
        }
      }
      if (slotFound && slotFound.chip === last.chip) {
        returnChipHome(last.chip);
        setFeedback('');
        updateMovesFeedback();
        return;
      }
    }
  }

  function clearBoardMoves() {
    clearAllSlots();
    moveCount = 0;
    setFeedback('');
    updateMovesFeedback();
  }

  function chipMatchesSlot(chip, slot) {
    if (isBalanceMode()) {
      return chip.kind === 'num' && (slot.role === 'pan-l' || slot.role === 'pan-r');
    }
    return slot.role === chip.kind;
  }

  function reparentChipToPool(chip) {
    if (chip.el.parentElement !== poolEl) {
      poolEl.appendChild(chip.el);
    }
  }

  function reparentChipToStage(chip) {
    if (chip.el.parentElement === stage) return;
    var stageRect = stage.getBoundingClientRect();
    var chipRect = chip.el.getBoundingClientRect();
    stage.appendChild(chip.el);
    var left = chipRect.left - stageRect.left;
    var top = chipRect.top - stageRect.top;
    chip.el.style.left = (left / stageRect.width) * 100 + '%';
    chip.el.style.top = (top / stageRect.height) * 100 + '%';
  }

  function setChipStagePosition(chip, clientX, clientY, offsetX, offsetY) {
    var stageRect = stage.getBoundingClientRect();
    var chipW = chip.el.offsetWidth;
    var chipH = chip.el.offsetHeight;
    var left = clientX - stageRect.left - offsetX;
    var top = clientY - stageRect.top - offsetY;
    left = Math.max(0, Math.min(left, stageRect.width - chipW));
    top = Math.max(0, Math.min(top, stageRect.height - chipH));
    chip.el.style.left = (left / stageRect.width) * 100 + '%';
    chip.el.style.top = (top / stageRect.height) * 100 + '%';
  }

  function cancelDragRaf() {
    if (dragRafId !== null) {
      cancelAnimationFrame(dragRafId);
      dragRafId = null;
    }
  }

  function flushDragVisual() {
    dragRafId = null;
    if (!dragState || dragState.pending) return;
    var chip = dragState.chip;
    var cx = dragState.pointerClientX;
    var cy = dragState.pointerClientY;
    if (cx == null || cy == null) return;
    setChipStagePosition(chip, cx, cy, dragState.offsetX, dragState.offsetY);
    setDropTarget(getNearestSlot(chip));
  }

  function scheduleDragVisual() {
    if (dragRafId !== null) return;
    dragRafId = requestAnimationFrame(flushDragVisual);
  }

  function rectIntersectionArea(a, b) {
    var left = Math.max(a.left, b.left);
    var right = Math.min(a.right, b.right);
    var top = Math.max(a.top, b.top);
    var bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
  }

  function pointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function getSnapRadius(slotRect) {
    return Math.max(44, Math.min(slotRect.width, slotRect.height) * 0.85);
  }

  function clearDropTarget() {
    slots.forEach(function (slot) {
      slot.el.classList.remove('is-drop-target');
    });
    dropTargetSlot = null;
  }

  function setDropTarget(slot) {
    if (dropTargetSlot === slot) return;
    clearDropTarget();
    dropTargetSlot = slot;
    if (slot) slot.el.classList.add('is-drop-target');
  }

  function activateDrag(state, e) {
    state.pending = false;
    var chip = state.chip;
    var chipRect = chip.el.getBoundingClientRect();
    reparentChipToStage(chip);
    state.offsetX = e.clientX - chipRect.left;
    state.offsetY = e.clientY - chipRect.top;
    try {
      chip.el.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    chip.el.classList.add('is-dragging');
    stage.classList.add('is-dragging');
    dragState.pointerClientX = e.clientX;
    dragState.pointerClientY = e.clientY;
    scheduleDragVisual();
  }

  function onPointerDown(e) {
    if (reducedMotion) return;
    var chip = getChipFromEl(e.currentTarget);
    if (!chip) return;
    if (isBalanceMode() && chip.kind !== 'num') return;

    if (chip.slotId) {
      if (moveStack.length && moveStack[moveStack.length - 1].chip === chip) {
        moveStack.pop();
      }
      releaseChip(chip);
    }

    var rect = e.currentTarget.getBoundingClientRect();
    dragState = {
      chip: chip,
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      pointerClientX: e.clientX,
      pointerClientY: e.clientY,
      pending: true,
      moved: false
    };
  }

  function onPointerMove(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    if (dragState.pending) {
      var dx = e.clientX - dragState.startX;
      var dy = e.clientY - dragState.startY;

      if (Math.hypot(dx, dy) < DRAG_ACTIVATE_PX) {
        return;
      }

      activateDrag(dragState, e);
    }

    if (dragState.pending) return;

    e.preventDefault();

    dragState.pointerClientX = e.clientX;
    dragState.pointerClientY = e.clientY;
    dragState.moved = true;
    scheduleDragVisual();
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function getNearestSlot(chip) {
    var chipRect = chip.el.getBoundingClientRect();
    var chipArea = chipRect.width * chipRect.height;
    var chipCenter = {
      x: chipRect.left + chipRect.width / 2,
      y: chipRect.top + chipRect.height / 2
    };

    var best = null;
    var bestScore = -1;

    slots.forEach(function (slot) {
      if (slot.chip || !chipMatchesSlot(chip, slot)) return;
      var slotRect = slot.el.getBoundingClientRect();
      var overlap = rectIntersectionArea(chipRect, slotRect);
      var overlapRatio = chipArea > 0 ? overlap / chipArea : 0;
      var centerInside = pointInRect(chipCenter.x, chipCenter.y, slotRect);
      var center = {
        x: slotRect.left + slotRect.width / 2,
        y: slotRect.top + slotRect.height / 2
      };
      var d = dist(chipCenter, center);
      var snapRadius = getSnapRadius(slotRect);
      var qualifies = overlapRatio >= 0.2 || centerInside || d <= snapRadius;

      if (!qualifies) return;

      var score = overlapRatio * 1000 + (centerInside ? 500 : 0) + Math.max(0, snapRadius - d);
      if (score > bestScore) {
        bestScore = score;
        best = slot;
      }
    });

    return best;
  }

  function trySnap(chip) {
    var best = getNearestSlot(chip);
    if (!best) return false;
    fillSlot(best, chip);
    return true;
  }

  function shakeMakeNumber() {
    if (!slotsEl) return;
    slotsEl.classList.add('is-shake');
    if (shakeTimer) clearTimeout(shakeTimer);
    shakeTimer = setTimeout(function () {
      slotsEl.classList.remove('is-shake');
      clearAllSlots();
    }, SHAKE_MS);
  }

  function shakeBalance() {
    if (!balanceEl) return;
    balanceEl.classList.add('is-tilt');
    if (shakeTimer) clearTimeout(shakeTimer);
    shakeTimer = setTimeout(function () {
      balanceEl.classList.remove('is-tilt');
      clearAllSlots();
    }, SHAKE_MS);
  }

  function celebrateWin() {
    var theme = getTheme(currentTheme);
    root.classList.add('is-complete');
    if (toastEl) {
      toastEl.textContent = theme.toasts[toastIndex % theme.toasts.length];
      toastIndex++;
      toastEl.hidden = false;
    }
    setFeedback('');

    if (isBalanceMode()) {
      root.classList.add('is-balanced');
    } else {
      root.classList.add('is-pop');
      if (bubbleEl) bubbleEl.classList.add('is-pop');
    }

    successTimer = setTimeout(function () {
      root.classList.remove('is-complete', 'is-pop', 'is-balanced');
      if (bubbleEl) bubbleEl.classList.remove('is-pop');
      if (toastEl) toastEl.hidden = true;
      loadTheme(currentTheme, false);
    }, SUCCESS_MS);
  }

  function checkMakeNumber() {
    if (!allSlotsFilled()) return;

    var vals = getSlotValues();
    if (vals.a === null || vals.op === null || vals.b === null) return;

    if (evalCombo(vals.a, vals.op, vals.b) !== currentTarget) {
      showFeedback('Try again!');
      shakeMakeNumber();
      return;
    }

    celebrateWin();
  }

  function checkBalance() {
    if (!allSlotsFilled()) return;

    var pans = getPanValues();
    if (pans.left === null || pans.right === null) return;

    if (pans.left !== pans.right || pans.left + pans.right !== currentTarget) {
      showFeedback('Make them equal!');
      shakeBalance();
      return;
    }

    celebrateWin();
  }

  function checkAfterMove() {
    if (isBalanceMode()) {
      checkBalance();
    } else {
      checkMakeNumber();
    }
  }

  function onPointerUp(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    cancelDragRaf();

    if (dragState.pending) {
      dragState = null;
      return;
    }

    var chip = dragState.chip;
    var cx = dragState.pointerClientX != null ? dragState.pointerClientX : e.clientX;
    var cy = dragState.pointerClientY != null ? dragState.pointerClientY : e.clientY;
    setChipStagePosition(chip, cx, cy, dragState.offsetX, dragState.offsetY);

    chip.el.classList.remove('is-dragging');
    stage.classList.remove('is-dragging');
    clearDropTarget();

    try {
      chip.el.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }

    if (dragState.moved) {
      moveCount++;
      var snapped = trySnap(chip);
      if (!snapped && !chip.slotId) {
        returnChipHome(chip);
      }
      updateMovesFeedback();
    }

    dragState = null;
    checkAfterMove();
  }

  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);

  function cancelActiveDrag() {
    cancelDragRaf();
    if (!dragState) return;
    var chip = dragState.chip;
    if (chip && chip.el) {
      chip.el.classList.remove('is-dragging');
      if (!dragState.pending && dragState.moved && !chip.slotId) {
        returnChipHome(chip);
      } else if (!chip.slotId && chip.el.parentElement === stage) {
        reparentChipToPool(chip);
        chip.el.style.left = chip.homeLeft + '%';
        chip.el.style.top = chip.homeTop + '%';
      }
    }
    clearDropTarget();
    stage.classList.remove('is-dragging');
    dragState = null;
  }

  if (undoBtn) {
    undoBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      cancelActiveDrag();
      undoLastMove();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      cancelActiveDrag();
      clearBoardMoves();
    });
  }

  document.addEventListener('hero-theme-change', function (e) {
    var theme = e.detail && e.detail.theme;
    if (theme) {
      lastTarget = null;
      loadTheme(theme, false);
    }
  });

  document.addEventListener('hero-game-close', cancelActiveDrag);

  loadTheme('results', false);
})();
