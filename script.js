$(document).ready(function () {
    // Load existing todo items from local storage
    var todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Function to render todo items
    function renderTodos() {
        var todoItems = $('#todo-items');
        todoItems.empty();

        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            var todoItem = $('<div>', { class: 'todo-item' + (todo.finished ? ' finished' : '') });
            var todoText = $('<span>', { text: todo.text });
            var actions = $('<div>', { class: 'actions' });

            var deleteButton = $('<button>', {
                class: 'btn  btn-danger',
                html: '<i class="fas fa-trash-alt"></i>',
                click: (function (index) {
                    return function () {
                        todos.splice(index, 1);
                        saveTodos();
                        renderTodos();
                    };
                })(i)
            });

            var finishButton = $('<button>', {
                class: 'btn  btn-success',
                html: '<i class="fas fa-check"></i>',
                click: (function (index) {
                    return function () {
                        var todoItem = $(this).closest('.todo-item');
                        todoItem.toggleClass('finished');
                        todos[index].finished = !todos[index].finished;
                        saveTodos();
                    };
                })(i)
            });

            var editButton = $('<button>', {
                class: 'btn  btn-primary',
                html: '<i class="fas fa-edit"></i>',
                click: (function (index) {
                    return function () {
                        var todoItem = $(this).closest('.todo-item');
                        var todoText = todoItem.find('span').text();
                        $('#edit-text').val(todoText); // Set the initial value of the edit input
                        $('#edit-text').select(); // Select all the text in the edit input

                        $('#edit-dialog').modal('show'); // Open the edit dialog

                        // Set focus on the edit text box
                        $('#edit-text').focus();

                        // Handle form submission
                        $('#edit-form').submit(function (event) {
                            event.preventDefault();
                            var editText = $('#edit-text').val().trim();
                            if (editText !== '') {
                                todos[index].text = editText;
                                saveTodos();
                                renderTodos();
                                $('#edit-dialog').modal('hide'); // Hide the edit dialog
                            } else {
                                showAlert('Please edit something!', 'warning');
                            }
                            $(this).off('submit'); // Remove the form submission handler
                        });

                        // Handle cancel button click
                        $('#cancel-button').click(function () {
                            $('#edit-dialog').modal('hide'); // Hide the edit dialog
                            $(this).off('click'); // Remove the cancel button click handler
                        });
                    };
                })(i)
            });

            actions.append(deleteButton, finishButton, editButton);
            todoItem.append(todoText, actions);
            todoItems.append(todoItem);
        }

        // Enable drag and drop functionality
        todoItems.sortable({
            containment: 'parent',
            tolerance: 'pointer',
            start: function (e, ui) {
                // Add a class to the dragged item and the other items
                ui.item.addClass('dragging');
                $('.todo-item:not(.dragging)').addClass('fading');
            },
            stop: function (e, ui) {
                // Remove the classes from the dragged item and the other items
                ui.item.removeClass('dragging');
                $('.todo-item:not(.dragging)').removeClass('fading');
            },
            update: function (event, ui) {
                var reorderedTodos = [];
                todoItems.children('.todo-item').each(function () {
                    var index = $(this).index();
                    reorderedTodos.push(todos[index]);
                });
                todos = reorderedTodos;
                saveTodos();
            }
        });
    }

    // Save todos to local storage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Function to show the alert message
    function showAlert(message, alertType) {
        var alertDiv = $('<div>', { class: 'alert alert-dismissible fade show alert-' + alertType, role: 'alert' });
        var alertText = $('<span>', { text: message });
        var closeButton = $('<button>', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'alert', 'aria-label': 'Close' });

        alertDiv.append(alertText, closeButton);
        $('#alert-container').html(alertDiv);

        setTimeout(function () {
            $('.alert').alert('close');
        }, 10000);
    }

    // Add todo item
    function addTodo() {
        var todoText = $('#todo-text').val().trim();

        if (todoText !== '') {
            todos.push({ text: todoText, finished: false });
            saveTodos();
            renderTodos();
            $('#todo-text').val('');
            showAlert('Task added successfully!', 'success');

            // Set focus on the add todo text box
            $('#todo-text').focus();
        } else {
            showAlert('Please enter a task!', 'warning');
        }
    }


    // Handle click event on add button
    $('#add-button').click(function () {
        addTodo();
    });

    // Handle keyup event on input field
    $('#todo-text').keyup(function (event) {
        if (event.keyCode === 13) { // Enter key code
            addTodo();
        }
    });

    // Clear all todo items
    $('#clear-button').click(function () {
        todos = [];
        saveTodos();
        renderTodos();
    });

    // Render initial todo items
    renderTodos();
});