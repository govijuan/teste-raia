(() => {
    const selector = selector => {
        const cleanSelector = selector.replace('#', '');
        return document.getElementById(cleanSelector)
    };
    const create = element => document.createElement(element);

    const app = selector('#app');
    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();
        const [email, password] = e.target.children;

        const {url} = await fakeAuthenticate(email.value, password.value);

        location.href='#users';
        
        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5) 
            ? button.setAttribute('disabled','disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = `  
                        <input type="email" name="email" id="email" placeholder="Entre com seu e-mail"/>
                        <input type="password" name="password" id="password" placeholder="Digite sua senha supersecreta"/>
                        <input name="button" type="submit" value="Entrar" disabled/> 
                    `;
    
    const mainURL = 'http://www.mocky.io/v2/5dba690e3000008c00028eb6';

    app.appendChild(Logo);
    Login.appendChild(Form);
    
    async function fakeAuthenticate(email, password) {
        
        let headers = new Headers();
        headers.append('Accept', 'application/json')
        let req = new Request(mainURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
        }
        })
        const data = await fetch(req)
            .then(res => res.json())
            .catch( err => console.log('Erro na requisição da URL primária -- erro:' + err));

        const fakeJwtToken = `${btoa(email+password)}.${btoa(data.url)}.${(new Date()).getTime()+300000}`;
        if(data !== undefined){
            sessionStorage.setItem('token', fakeJwtToken)
            Form.classList.add('disabled-form');
        }
        

        return data;
    }

    async function getDevelopersList(url) {
        return fetch(url).then(res => res.json())
    }

    function renderPageUsers(users) {

        app.classList.add('logged');
        if(document.getElementsByClassName('login').length > 0){
            Login.style.height = '0';
            setTimeout(()=>{Login.style.display = 'none'}, 5000);
        }
        
        Login.style.display = 'none';
        const Ul = create('ul');
        Ul.classList.add('container')

        users.map((user, key) => {
            const userElement = `   <li id=${user.id} class="user-container">
                                        <a href=${user.html_url} target="_blank">
                                            <div class="avatar-cont">
                                                <img src=${user.avatar_url} alt="${user.login}'s avatar" />
                                            </div>
                                            <div class="user-name">${user.login}</div>
                                        </a>
                                    </li>
                                `;
            Ul.insertAdjacentHTML('beforeend', userElement);
        })

        app.appendChild(Ul)
    }

    // init
    (async function(){
        const rawToken = sessionStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            app.appendChild(Login);
            const appHeight = app.offsetHeight;
            const loginPadding = ( appHeight / 2 ) -116;
            app.style.paddingTop = `${loginPadding}px`;
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
            app.style.paddingTop = '';
        }
    })()
})()