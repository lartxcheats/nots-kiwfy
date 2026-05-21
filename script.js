let comprovantes = [];
let autoNotificationInterval = null;
let autoNotificationTimeout = null;
let deferredPrompt = null;
let notificacoesEnviadas = 0;
let notificacoesTotal = 0;
let notificacoesEnviadasManual = 0;
let notificacoesTotalManual = 0;

// Valores dos cursos da Kiwify
const valoresCursos = [52.02, 30.18];

const form = document.getElementById('comprovanteForm');
const notificationArea = document.getElementById('notificationArea');
const comprovantesList = document.getElementById('comprovantesList');
const enableNotificationsBtn = document.getElementById('enableNotifications');
const installAppBtn = document.getElementById('installApp');
const startAutoBtn = document.getElementById('startAuto');
const stopAutoBtn = document.getElementById('stopAuto');
const stopManualBtn = document.getElementById('stopManual');
const quantidadeInput = document.getElementById('quantidadeNotif');
const intervaloInput = document.getElementById('intervaloSegundos');
const duracaoInput = document.getElementById('duracaoMinutos');
const valorAutoInput = document.getElementById('valorAuto');
const tipoAutoInput = document.getElementById('tipoAuto');
const statusNotif = document.getElementById('statusNotif');
const statusManual = document.getElementById('statusManual');

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registrado'))
        .catch(err => console.log('Erro no Service Worker:', err));
}

// Capturar evento de instalação do PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installAppBtn.style.display = 'block';
});

installAppBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') installAppBtn.style.display = 'none';
    deferredPrompt = null;
});

// Ativar notificações
enableNotificationsBtn.addEventListener('click', async () => {
    if (!('Notification' in window)) {
        alert('Seu navegador não suporta notificações');
        return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        enableNotificationsBtn.textContent = '✅ Notificações Ativadas';
        enableNotificationsBtn.disabled = true;
        enviarNotificacaoKiwufy('Venda Aprovada!', 'Valor: R$ 0,00');
    } else {
        alert('Permissão negada. Ative nas configurações do navegador.');
    }
});

if (Notification.permission === 'granted') {
    enableNotificationsBtn.textContent = '✅ Notificações Ativadas';
    enableNotificationsBtn.disabled = true;
}

// Modo Manual
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const quantidade = parseInt(document.getElementById('quantidadeManual').value);

    if (Notification.permission !== 'granted') {
        alert('Ative as notificações primeiro!');
        return;
    }
    if (quantidade < 1) {
        alert('Configure valores válidos!');
        return;
    }

    notificacoesEnviadasManual = 0;
    notificacoesTotalManual = quantidade;
    stopManualBtn.style.display = 'block';
    statusManual.style.display = 'block';

    document.getElementById('quantidadeManual').disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;

    atualizarStatusManual();

    for (let i = 0; i < quantidade; i++) {
        setTimeout(() => {
            gerarNotificacao(true);
            if (notificacoesEnviadasManual >= notificacoesTotalManual) {
                pararNotificacoesManual();
                statusManual.innerHTML = '✅ Todas as vendas foram enviadas!';
                setTimeout(() => { statusManual.style.display = 'none'; }, 3000);
            }
        }, i * 1500); // 1.5s entre cada venda (para dar tempo das 2 notificações)
    }
});

stopManualBtn.addEventListener('click', () => pararNotificacoesManual());

function pararNotificacoesManual() {
    stopManualBtn.style.display = 'none';
    document.getElementById('quantidadeManual').disabled = false;
    form.querySelector('button[type="submit"]').disabled = false;
    notificacoesEnviadasManual = 0;
    notificacoesTotalManual = 0;
}

function atualizarStatusManual() {
    if (notificacoesTotalManual > 0) {
        statusManual.innerHTML = `📊 Vendas enviadas: ${notificacoesEnviadasManual} de ${notificacoesTotalManual} (${notificacoesEnviadasManual * 2} notificações)`;
    }
}

// Modo Automático
startAutoBtn.addEventListener('click', () => {
    const quantidade = parseInt(quantidadeInput.value);
    const intervaloSegundos = parseInt(intervaloInput.value);
    const duracaoMinutos = parseInt(duracaoInput.value);

    if (Notification.permission !== 'granted') {
        alert('Ative as notificações primeiro!');
        return;
    }
    if (quantidade < 1 || intervaloSegundos < 1 || duracaoMinutos < 1) {
        alert('Configure valores válidos!');
        return;
    }

    const intervaloMs = intervaloSegundos * 1000;
    const duracaoMs = duracaoMinutos * 60 * 1000;

    notificacoesEnviadas = 0;
    notificacoesTotal = quantidade;

    startAutoBtn.style.display = 'none';
    stopAutoBtn.style.display = 'block';
    quantidadeInput.disabled = true;
    intervaloInput.disabled = true;
    duracaoInput.disabled = true;
    statusNotif.style.display = 'block';

    atualizarStatus();
    gerarNotificacao();

    autoNotificationInterval = setInterval(() => {
        if (notificacoesEnviadas >= notificacoesTotal) return;
        gerarNotificacao();
    }, intervaloMs);

    autoNotificationTimeout = setTimeout(() => {
        pararNotificacoes();
        statusNotif.innerHTML = '✅ Tempo finalizado!';
        setTimeout(() => { statusNotif.style.display = 'none'; }, 3000);
    }, duracaoMs);
});

stopAutoBtn.addEventListener('click', () => pararNotificacoes());

function pararNotificacoes() {
    clearInterval(autoNotificationInterval);
    clearTimeout(autoNotificationTimeout);
    startAutoBtn.style.display = 'block';
    stopAutoBtn.style.display = 'none';
    quantidadeInput.disabled = false;
    intervaloInput.disabled = false;
    duracaoInput.disabled = false;
    notificacoesEnviadas = 0;
    notificacoesTotal = 0;
}

function atualizarStatus() {
    if (notificacoesTotal > 0) {
        statusNotif.innerHTML = `📊 Vendas enviadas: ${notificacoesEnviadas} de ${notificacoesTotal} (${notificacoesEnviadas * 2} notificações)`;
    }
}

function getValorAleatorio() {
    return valoresCursos[Math.floor(Math.random() * valoresCursos.length)];
}

function gerarNotificacao(isManual = false) {
    const valor = getValorAleatorio();
    const corpo = `Valor: R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;

    // Sempre envia PIX primeiro, depois VENDA (como no print)
    const notificacoes = [
        { titulo: 'Pix Gerado!', tipo: 'pix' },
        { titulo: 'Venda Aprovada!', tipo: 'venda' }
    ];

    notificacoes.forEach((notif, index) => {
        setTimeout(() => {
            const comprovante = {
                id: Date.now() + Math.random(),
                titulo: notif.titulo,
                corpo: corpo,
                valor: parseFloat(valor).toFixed(2),
                tipo: notif.tipo,
                timestamp: new Date().toLocaleString('pt-BR')
            };

            comprovantes.unshift(comprovante);
            mostrarNotificacaoNaTela(comprovante);
            atualizarLista();
            enviarNotificacaoKiwufy(notif.titulo, corpo);
        }, index * 500); // 500ms de delay entre as notificações
    });

    if (isManual) {
        notificacoesEnviadasManual++;
        atualizarStatusManual();
    } else {
        notificacoesEnviadas++;
        atualizarStatus();
    }
}

function mostrarNotificacaoNaTela(comprovante) {
    const emptyState = notificationArea.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <h3>🍉 Kiwufy</h3>
        <p><strong>${comprovante.titulo}</strong></p>
        <p>${comprovante.corpo}</p>
    `;

    notificationArea.insertBefore(notification, notificationArea.firstChild);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function atualizarLista() {
    if (comprovantes.length === 0) {
        comprovantesList.innerHTML = '<p class="empty-state">Nenhum comprovante ainda</p>';
        return;
    }
    comprovantesList.innerHTML = comprovantes.map(comp => `
        <div class="comprovante-item">
            <h3>${comp.titulo}</h3>
            <p>${comp.corpo}</p>
            <p class="timestamp">📅 ${comp.timestamp}</p>
        </div>
    `).join('');
}

atualizarLista();

function enviarNotificacaoKiwufy(titulo, corpo) {
    if (Notification.permission !== 'granted') return;

    const options = {
        body: corpo,
        icon: './iconeki.png',
        badge: './iconeki.png',
        tag: 'kiwufy-' + Date.now(),
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        data: { url: window.location.href },
        dir: 'ltr',
        lang: 'pt-BR'
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(titulo, options);
        });
    } else {
        new Notification(titulo, options);
    }
}

// Link do Instagram
document.querySelector('.instagram-link').addEventListener('click', function(e) {
    const instagramUrl = 'https://www.instagram.com/guhhh_44?igsh=d3FzMmRkbDM3eTRo&utm_source=qr';
    const instagramApp = 'instagram://user?username=guhhh_44';
    window.location.href = instagramApp;
    setTimeout(() => { window.open(instagramUrl, '_blank'); }, 1000);
    e.preventDefault();
});
