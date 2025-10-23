/*
	Quotes widget
	- Shows a new quote on each page load and on Next
	- Avoids repeating the last shown quote across reloads (via localStorage)
	- Fetches from Quotable with cache-busting; falls back to a local list offline
*/
(function(){
	const doc = document;
	const qs = (sel, ctx = doc) => ctx.querySelector(sel);

	const elCard = qs('#quote-widget');
	if(!elCard) return; // Widget not present

	const elText = qs('.quote-text', elCard);
	const elAuthor = qs('.quote-author', elCard);
	const btnNext = qs('#quote-next', elCard);
	const btnReset = qs('#quote-reset', elCard);
	const btnToggle = qs('#quote-toggle', elCard);

	const STORAGE_LAST_ID = 'quote:lastId';
	const STORAGE_HIDDEN = 'quote:hidden';
	const STORAGE_SHOWN = 'quote:shownIds';

	// Short, attribution-safe fallback quotes (<= 90 chars each)
	const FALLBACK_QUOTES = [
		{ id: 'f1', text: 'Small steps add up.', author: '— Unknown' },
		{ id: 'f2', text: 'Make it work, then make it better.', author: '— Unknown' },
		{ id: 'f3', text: 'Stay curious. Keep building.', author: '— Unknown' },
		{ id: 'f4', text: 'Progress over perfection.', author: '— Unknown' },
		{ id: 'f5', text: 'Focus on what you can control.', author: '— Unknown' },
		{ id: 'f6', text: 'Dream. Plan. Do.', author: '— Unknown' },
		{ id: 'f7', text: 'Energy flows where focus goes.', author: '— Unknown' },
		{ id: 'f8', text: 'Start where you are. Use what you have.', author: '— Unknown' },
		{ id: 'f9', text: 'Ship early. Learn fast.', author: '— Unknown' },
		{ id: 'f10', text: 'One more try can change everything.', author: '— Unknown' },
	];

	function getLastId(){
		try { return localStorage.getItem(STORAGE_LAST_ID); } catch { return null; }
	}
	function setLastId(id){
		try { localStorage.setItem(STORAGE_LAST_ID, id || ''); } catch {}
	}
	function getHidden(){
		try { return localStorage.getItem(STORAGE_HIDDEN) === '1'; } catch { return false; }
	}
	function setHidden(hidden){
		try { localStorage.setItem(STORAGE_HIDDEN, hidden ? '1' : '0'); } catch {}
	}
	function getShownSet(){
		try {
			const raw = localStorage.getItem(STORAGE_SHOWN);
			return new Set(raw ? JSON.parse(raw) : []);
		} catch { return new Set(); }
	}
	function saveShownSet(set){
		try { localStorage.setItem(STORAGE_SHOWN, JSON.stringify(Array.from(set))); } catch {}
	}

	async function fetchRandomQuote(){
		// Quotable random quote API; add cache-busting to avoid cached responses
		const url = `https://api.quotable.io/random?tags=inspirational&time=${Date.now()}`;
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if(!res.ok) throw new Error('Network response not ok');
			const data = await res.json();
			const id = data._id || String(Date.now());
			return { id, text: data.content || '', author: data.author ? `— ${data.author}` : '— Unknown' };
		} catch (e) {
			// Fallback to local list
			const q = pickFromFallback();
			return q;
		}
	}

	function pickFromFallback(excludeId){
		const pool = FALLBACK_QUOTES.filter(q => q.id !== excludeId);
		return pool[Math.floor(Math.random() * pool.length)] || FALLBACK_QUOTES[0];
	}

	function renderQuote(q){
		if(!elText || !elAuthor) return;
		elText.textContent = q.text;
		elAuthor.textContent = q.author || '— Unknown';
	}

	async function showNewQuote(){
		const lastId = getLastId();
		let q = await fetchRandomQuote();
		// If API served the same ID as last time, force a different one (best-effort)
		if(q.id && lastId && q.id === lastId){
			// Try one more network fetch; if that still matches, fallback pick
			try {
				const second = await fetchRandomQuote();
				if(second.id !== lastId) q = second; else q = pickFromFallback(lastId);
			} catch {
				q = pickFromFallback(lastId);
			}
		}
		renderQuote(q);
		setLastId(q.id || '');
		const shown = getShownSet();
		if(q.id) { shown.add(q.id); saveShownSet(shown); }
	}

	function resetShown(){
		try { localStorage.removeItem(STORAGE_SHOWN); } catch {}
	}

	function applyHiddenState(init=false){
		const hidden = getHidden();
		if(init){ btnToggle && btnToggle.setAttribute('aria-pressed', hidden ? 'false' : 'true'); }
		elCard.classList.toggle('is-hidden', hidden);
		// Minimal hide: collapse the content area only
		const content = qs('.quote-content', elCard);
		if(content){ content.style.display = hidden ? 'none' : ''; }
		if(btnToggle){ btnToggle.textContent = hidden ? 'Show' : 'Hide'; }
	}

	// Wire up events
	if(btnNext){ btnNext.addEventListener('click', showNewQuote); }
	if(btnReset){ btnReset.addEventListener('click', ()=>{ resetShown(); setLastId(''); showNewQuote(); }); }
	if(btnToggle){
		btnToggle.addEventListener('click', ()=>{
			const currentlyHidden = getHidden();
			setHidden(!currentlyHidden);
			applyHiddenState();
		});
	}

	// Initialize
	applyHiddenState(true);
	// Show a fresh quote on every load
	showNewQuote();
})();

