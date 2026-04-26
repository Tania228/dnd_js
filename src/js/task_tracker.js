export default class TaskTracker {
    constructor() {
        try{
            this.container = document.querySelector('.container-for-column');
            this.columns = this.container.querySelectorAll('.column');
            this.btns = this.container.querySelectorAll('.btn-add-card');
            this.draggedCard = null;
            this.placeholder = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
        } 
        catch(error) {
            console.error(`Ошибка: ${error.message}`);
        }
    }

    deleteCard(cardElement) {
        cardElement.remove();
    }

    createDeleteButton(cardElement) {
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-card';
        deleteBtn.innerHTML = '✕';
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCard(cardElement);
        });
        
        return deleteBtn;
    }

    addDragHandlers(element) {
        element.draggable = true;
        
        element.addEventListener('dragstart', (e) => {
            this.draggedCard = element;
            const rect = element.getBoundingClientRect();
            this.dragOffsetX = e.clientX - rect.left;
            this.dragOffsetY = e.clientY - rect.top;
            
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            
            const dragIcon = document.createElement('div');
            dragIcon.style.opacity = '0';
            document.body.appendChild(dragIcon);
            e.dataTransfer.setDragImage(dragIcon, 0, 0);
            setTimeout(() => document.body.removeChild(dragIcon), 0);
            
            element.style.opacity = '0.4';
            element.style.cursor = 'grabbing';
        });
        
        element.addEventListener('dragend', (e) => {
            element.style.opacity = '1';
            element.style.cursor = '';
            this.removePlaceholder();
            this.draggedCard = null;
        });
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    addDragoverToColumn() {
        this.columns.forEach(column => {
            const cardsContainer = column.querySelector('.cards-container');
            
            cardsContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (!this.draggedCard) return;
                
                const cards = Array.from(cardsContainer.querySelectorAll('.text-display:not(.drag-placeholder)'));
                
                if (cards.length === 0) {
                    if (!this.placeholder || this.placeholder.parentElement !== cardsContainer) {
                        this.removePlaceholder();
                        this.placeholder = this.createPlaceholder(this.draggedCard.offsetHeight);
                        cardsContainer.appendChild(this.placeholder);
                    }
                    return;
                }
                
                let targetCard = null;
                for (let card of cards) {
                    const rect = card.getBoundingClientRect();
                    if (e.clientY < rect.top + rect.height) {
                        targetCard = card;
                        break;
                    }
                }
                
                if (!targetCard) {
                    targetCard = cards[cards.length - 1];
                }
                
                if (targetCard && targetCard !== this.draggedCard) {
                    const rect = targetCard.getBoundingClientRect();
                    const mouseY = e.clientY;
                    const isAfter = mouseY > rect.top + rect.height / 2;
                    
                    this.removePlaceholder();
                    this.placeholder = this.createPlaceholder(this.draggedCard.offsetHeight);
                    
                    if (isAfter) {
                        if (targetCard.nextSibling) {
                            cardsContainer.insertBefore(this.placeholder, targetCard.nextSibling);
                        } else {
                            cardsContainer.appendChild(this.placeholder);
                        }
                    } else {
                        cardsContainer.insertBefore(this.placeholder, targetCard);
                    }
                }
            });
            
            cardsContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!this.draggedCard || !this.placeholder) return;
                
                this.placeholder.parentElement.insertBefore(this.draggedCard, this.placeholder);
                this.removePlaceholder();
                this.draggedCard.style.opacity = '1';
                this.draggedCard = null;
            });
        });
    }

    createPlaceholder(height) {
        const placeholder = document.createElement('li');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = `${height}px`;
        placeholder.style.backgroundColor = '#e0e0e0';
        placeholder.style.border = '2px dashed #999';
        placeholder.style.borderRadius = '4px';
        placeholder.style.margin = '4px 0';
        return placeholder;
    }

    removePlaceholder() {
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.remove();
        }
        this.placeholder = null;
    }

    addTask() {
        this.addDragoverToColumn();
        
        this.btns.forEach(btn => {  
            btn.addEventListener('click', () => {
                const currentColumn = btn.closest('.column');
                const cardsContainer = currentColumn.querySelector('.cards-container');
                const inputEx = cardsContainer.querySelector('input');
                
                if (!inputEx) {
                    const taskText = document.createElement('input');
                    taskText.type = 'text';
                    taskText.className = 'text-task';
                    taskText.placeholder = 'Введите текст задачи...';
                    
                    cardsContainer.appendChild(taskText);
                    taskText.focus();
                } else {
                    const savedText = inputEx.value;
                    
                    if (savedText.trim() !== "") {
                        const textDisplay = document.createElement('li');
                        textDisplay.className = 'text-display';
                        textDisplay.textContent = savedText;
                        
                        const deleteBtn = this.createDeleteButton(textDisplay);
                        textDisplay.appendChild(deleteBtn);
                        
                        this.addDragHandlers(textDisplay);
                        
                        cardsContainer.appendChild(textDisplay);
                        inputEx.remove(); 
                    }
                }
            });
        });
    }
}