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

    Form.innerHTML = '<div class="form-group"><input type="email" name="email" id="email" /></div><div class="form-group"><input type="password" name="password" id="password" /></div><input type="submit" value="Entrar" />';
    
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
        /* trecho omitido */
        if(data !== undefined){
            sessionStorage.setItem('token', fakeJwtToken)
            Form.classList.add('disabled-form');
        }
        

        return data;
    }

    async function getDevelopersList(url) {
        /**
         * bloco de código omitido
         * aqui esperamos que você faça a segunda requisição 
         * para carregar a lista de desenvolvedores
         */
        return fetch(url).then(res => res.json())
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        //Login.style.display = /* trecho omitido */
        Login.style.display = 'none';
        const Ul = create('ul');
        Ul.classList.add('container')

        /**
         * bloco de código omitido
         * exiba a lista de desenvolvedores
         */
        users.map((user, key) => {
            const userElement = `<li id=${user.id} class="user-container">
                                    <div class="avatar-cont">
                                        <img src=${user.avatar_url} alt="${user.login}'s avatar" />
                                    </div>
                                    <div class="user-name">${user.login}</div>
                                </li>`;
            Ul.insertAdjacentHTML('beforeend', userElement);
        })

        app.appendChild(Ul)
    }

    // init
    (async function(){
        console.log('Rodando init');
        const rawToken = sessionStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            app.appendChild(Login);
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()