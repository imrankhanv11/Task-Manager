
// run the operation after the document was render (html)
$('document').ready(function () {


    // url
    const url = 'http://localhost:3000/Task';

    // ------------- ADD NEW TASK ---------------------
    $('#myForm').on('submit', async function (e) {
        e.preventDefault();

        // getting the inputs form UI
        let title = $('#title').val();

        // title validation
        if (title.trim().length <= 2) {
            alert('Title need atleast 3 char');
            return;
        }
        let discription = $('#discription').val();
        let priority = $('#priority').val();


        let isDone = $('input[name="complete"]:checked').val();

        // Others 
        let todyDate = new Date();
        let createdDate = todyDate.toDateString();
        let updatedDate = 'New task';

        // try-catch
        try {
            const taskResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    discription,
                    priority,
                    createdDate,
                    isDone,
                    updatedDate
                })
            });

            // check the the status
            if (!taskResponse.ok) {
                throw new Error("Can't Sumbit your details please try again. Sorry for this issue");
            }

            const data = await taskResponse.json();

            // ----------------- STORED IN SESSTIONS STORAGE ------------------
            for (let key in data) {
                localStorage.setItem(key, data[key]);
            }

        }
        catch (error) {
            console.log(`The Error : ${error}`);
            alert('Error Occured');
        }
    });

    // ------------ DISPLAY THE TASK IN UI ------------
    async function displayTask() {

        // getting the output div for display
        const output = $('#output');
        output.empty();

        // get method to fetch and display
        try {
            const getResponse = await fetch(url);

            // check any error occure
            if (!getResponse.ok) {
                throw new Error('Fetch Error');
            }

            // converstion
            const data = await getResponse.json();

            if (Object.keys(data).length === 0) {
                let h2 = $('<h2>').text('Hey, you finish all task please add new to do').css('color', 'red').css('text-aling', 'center');
                output.append(h2);
                return;
            }

            // task list
            let h3 = $('<h3>').text('Your Tasks :');
            output.append(h3);

            // foreach loop to seprate each task
            data.forEach(Element => {
                output.append(displayFormat(Element));
            });

        }
        catch (error) {
            console.log(`Error : ${error}`);
        }
    }

    // ---------- FORMAT THE TASK AND DETAILS TO DISPLAY IN UI ---------
    function displayFormat(data) {
        const maindiv = $('<div>').addClass('maindiv');
        const ul = $('<ul>');

        let id;
        // for...in loop --for seprate each one
        for (let key in data) {

            // not need id
            if (key == 'id') {
                id = data[key];
                continue;
            }

            const li = $('<li>').css('list-style-type', 'none');
            const strong = $('<strong>').text(`${cap(key)} : `).css('color', 'red');

            const value = $('<span>').text(data[key]);

            li.append(strong).append(value);
            ul.append(li);
        }

        function cap(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        maindiv.append(ul);
        // button for delete
        let delBtn = $('<button>')
            .addClass('delbtn')
            .attr('data-id', id)
            .text('Delete');

        // button for edit
        let upBtn = $('<button>')
            .addClass('upbtn')
            .attr('data-id', id)
            .text('Edit');

        let btndiv = $('<div>').addClass('btndiv');

        btndiv.append(delBtn).append(upBtn);

        maindiv.append(btndiv);

        return maindiv;
    }
    displayTask();

    // ------------------- DELETE THE TASK -----------------------
    $('#output').on('click', '.delbtn', async function (e) {
        e.preventDefault();

        const id = $(this).attr('data-id');

        try {
            const delresponse = await fetch(`${url}/${id}`, {
                method: 'DELETE'
            });

            if (!delresponse.ok) {
                throw new Error('Delete failed');
            }

        } catch (error) {
            console.error(error);
        }
    });


    // for change id to update
    let changeId;

    // --------------- BEFORE UPDATE POPULATE THE DETAILS --------------
    $('#output').on('click', '.upbtn', async function (e) {
        e.preventDefault();

        // getting id which one need to update
        const id = $(this).attr('data-id');

        // set
        changeId = id;

        // this btn
        $(this).hide();

        // hide post btn
        $('#post-btn').hide();

        // show put btn
        $('#put-btn').show();

        // getting input form to show 
        let title = $('#title');
        let discription = $('#discription');
        let priority = $('#priority');
        let isDone = $('input[name="complete"]');
        isDone.prop('checked', false);

        try {
            const upResponse = await fetch(`${url}/${id}`);
            const data = await upResponse.json();

            // populate the details
            title.val(data.title);
            discription.val(data.discription);
            priority.val(data.priority);
            $(`input[name="complete"][value="${data.isDone}"]`)
                .prop('checked', true);

        }
        catch (error) {
            console.log(`Error : ${error}`);
        }
    })

    // ----------------- UPDATE THE EDITED DETIALS ------------------
    $('#put-btn').on('click', async function (e) {
        e.preventDefault();


        // add btn
        $('#post-btn').show();

        // this btn
        $(this).hide();

        // getting the inputs form UI
        let title = $('#title').val();

        // title validation
        if (title.trim().length <= 2) {
            alert('Title need atleast 3 char');
            return;
        }

        let discription = $('#discription').val();
        let priority = $('#priority').val();

        let isDone = $('input[name="complete"]:checked').val();

        // for fetch createDate
        let createdDate;
        try {
            const creteResponse = await fetch(`${url}/${changeId}`);
            const data = await creteResponse.json();

            createdDate = data.createdDate;
        }
        catch (error) {
            console.log(error)
        }

        // for updated data
        let today = new Date();
        let updatedDate = today.toDateString();

        try {
            const upResponse = await fetch(`${url}/${changeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title, discription, priority, createdDate, isDone, updatedDate
                })
            })

            // adding in session storage
            sessionStorage.setItem('Updated id', changeId);
        }
        catch (error) {
            console.log(`Error : ${error}`);
        }
    })

    // -------------------SEARCH WITH PRIORITY------------
    $('#serch-btn-pre').on('click', async function (e) {
        e.preventDefault();

        // getting search input
        const searchPre = $('#p-search').val();

        // take output to show
        const output = $('#output');
        output.empty();

        // show the back btn
        const back = $('#searc-btn-pre-back');
        back.show();

        try {
            const preResponse = await fetch(url);

            if (!preResponse.ok) {
                throw new Error("Can't fetch the input");
            }

            const data = await preResponse.json();

            let count = 0;
            data.forEach(Element => {
                if (Element.priority === searchPre) {
                    output.append(displayFormat(Element));
                    count++;
                }
            });

            if (count === 0) {
                let h2 = $('<h2>').text(`No task in Priority of ${searchPre}`).css('color', 'red');
                output.append(h2);
            }

        }
        catch (error) {
            console.log(error);
        }
    })

    // back btn -- for pre
    $('#searc-btn-pre-back').on('click', function (e) {
        e.preventDefault();

        $(this).hide();
        displayTask();
    })

    //  --------------SEARCH WITH TITLE----------------------
    $('#t-search').on('input', async function (e) {
        e.preventDefault();

        let searchtit = $('#t-search').val();

        let backbtn = $('#searc-btn-tit-back');
        backbtn.show();

        // take output to show
        const output = $('#output');
        output.empty();

        try {
            const titResponse = await fetch(url);

            if (!titResponse.ok) {
                throw new Error("Can't fetch the data");
            }

            const data = await titResponse.json();

            let count = 0;
            data.forEach(element => {
                if (element.title.startsWith(searchtit)) {
                    output.append(displayFormat(element));
                    count++;
                }
            });


            if (count === 0) {
                let h2 = $('<h2>').text(`No task in Priority of ${searchPre}`).css('color', 'red');
                output.append(h2);
            }


        }
        catch (error) {
            console.log(error);
        }

    });

    // back btn -- for title
    $('#searc-btn-tit-back').on('click', function (e) {
        e.preventDefault();

        $('#t-search').val('');
        $(this).hide();
        displayTask();
    })


}); 