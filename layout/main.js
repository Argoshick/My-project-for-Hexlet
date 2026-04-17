// notes.js - управление заметками

class NotesApp {
    constructor() {
        this.notes = [];
        this.currentEditId = null;
        this.currentTagFilter = 'all';
        this.currentSearchQuery = '';
        this.init();
    }

    init() {
        this.loadNotes();
        this.render();
        this.bindEvents();
    }

    loadNotes() {
        const saved = localStorage.getItem('notes');
        if (saved) {
            this.notes = JSON.parse(saved);
        } else {
            this.saveNotes();
        }
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    bindEvents() {
        document.getElementById('addNoteBtn').addEventListener('click', () => this.openModal());
        document.getElementById('saveNoteBtn').addEventListener('click', () => this.saveNote());
        document.getElementById('deleteNoteBtn').addEventListener('click', () => this.deleteNote());
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearchQuery = e.target.value.toLowerCase();
            this.render();
        });
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.currentTagFilter = 'all';
            this.currentSearchQuery = '';
            document.getElementById('searchInput').value = '';
            this.render();
        });

        // Закрытие модалки при клике вне контента
        const modal = document.getElementById('noteModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    openModal(noteId = null) {
        const modal = document.getElementById('noteModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteNoteBtn');
        
        if (noteId !== null) {
            this.currentEditId = noteId;
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                modalTitle.textContent = 'Редактировать заметку';
                document.getElementById('noteTitle').value = note.title;
                document.getElementById('noteContent').value = note.content;
                document.getElementById('noteTags').value = note.tags.join(', ');
                deleteBtn.style.display = 'block';
            }
        } else {
            this.currentEditId = null;
            modalTitle.textContent = 'Новая заметка';
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            document.getElementById('noteTags').value = '';
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('noteModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentEditId = null;
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const tagsInput = document.getElementById('noteTags').value.trim();
        
        if (!title) {
            alert('Введите заголовок заметки');
            return;
        }
        
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];
        
        if (this.currentEditId !== null) {
            // Редактирование существующей заметки
            const index = this.notes.findIndex(n => n.id === this.currentEditId);
            if (index !== -1) {
                this.notes[index] = {
                    ...this.notes[index],
                    title,
                    content,
                    tags,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Новая заметка
            this.notes.push({
                id: Date.now(),
                title,
                content,
                tags,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        this.saveNotes();
        this.closeModal();
        this.render();
    }

    deleteNote() {
        if (confirm('Удалить эту заметку?')) {
            this.notes = this.notes.filter(n => n.id !== this.currentEditId);
            this.saveNotes();
            this.closeModal();
            this.render();
        }
    }

    getFilteredNotes() {
        let filtered = [...this.notes];
        
        // Фильтр по тегу
        if (this.currentTagFilter !== 'all') {
            filtered = filtered.filter(note => note.tags.includes(this.currentTagFilter));
        }
        
        // Поиск
        if (this.currentSearchQuery) {
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(this.currentSearchQuery) ||
                note.content.toLowerCase().includes(this.currentSearchQuery) ||
                note.tags.some(tag => tag.includes(this.currentSearchQuery))
            );
        }
        
        // Сортировка по дате обновления (новые сверху)
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        return filtered;
    }

    getAllTags() {
        const tagsSet = new Set();
        this.notes.forEach(note => {
            note.tags.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }

    render() {
        this.renderTags();
        this.renderNotes();
    }

    renderTags() {
        const tagsList = document.getElementById('tagsList');
        const allTags = this.getAllTags();
        
        // Очищаем и добавляем кнопку "Все заметки"
        tagsList.innerHTML = '<button class="tag-filter active" data-tag="all">Все заметки</button>';
        
        allTags.forEach(tag => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-filter';
            if (this.currentTagFilter === tag) tagBtn.classList.add('active');
            tagBtn.textContent = `#${tag}`;
            tagBtn.dataset.tag = tag;
            tagBtn.addEventListener('click', () => {
                this.currentTagFilter = tag;
                this.render();
            });
            tagsList.appendChild(tagBtn);
        });
        
        // Обновляем активное состояние
        document.querySelectorAll('.tag-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tag === this.currentTagFilter) {
                btn.classList.add('active');
            }
        });
    }

    renderNotes() {
        const notesList = document.getElementById('notesList');
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<div class="empty-notes">📭 Нет заметок. Создайте первую!</div>';
            return;
        }
        
        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-card" data-id="${note.id}">
                <div class="note-title">${this.escapeHtml(note.title)}</div>
                <div class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="note-date">${this.formatDate(note.updatedAt)}</div>
            </div>
        `).join('');
        
        // Добавляем обработчики кликов на карточки
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                this.openModal(id);
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'только что';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн назад`;
        
        return date.toLocaleDateString('ru-RU');
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});