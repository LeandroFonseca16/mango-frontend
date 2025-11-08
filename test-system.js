#!/usr/bin/env node

/**
 * Script de teste para testar o fluxo completo do sistema MangoBeat
 */

const axios = require('axios');
const baseURL = 'http://localhost:3000';

// Configurações de teste
const testUser = {
  email: 'test@mangobeat.com',
  password: 'password123',
  name: 'Test User'
};

const testTrack = {
  title: 'Meu Beat Trap Teste',
  audioPrompt: 'Heavy 808 bass with sharp hi-hats and dark atmospheric melody',
  imagePrompt: 'Dark urban street art with neon purple and pink colors, trap music aesthetic',
  description: 'Beat gerado automaticamente para teste',
  genre: 'trap',
  bpm: 140,
  duration: 60,
  key: 'C',
  mood: 'dark',
  tags: ['trap', 'dark', 'atmospheric', 'test']
};

let authToken = '';
let createdTrackId = '';

/**
 * Função utilitária para fazer requests
 */
async function makeRequest(method, endpoint, data = null, useAuth = false) {
  const config = {
    method,
    url: `${baseURL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    ...(data && { data })
  };

  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
}

/**
 * Testa se o servidor está rodando
 */
async function testServerHealth() {
  console.log('🏥 Testando health do servidor...');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success || result.status === 404) {
    console.log('✅ Servidor está rodando!');
    return true;
  } else {
    console.log('❌ Servidor não está respondendo:', result.error);
    return false;
  }
}

/**
 * Registra um usuário de teste
 */
async function registerTestUser() {
  console.log('👤 Registrando usuário de teste...');
  
  const result = await makeRequest('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ Usuário registrado com sucesso!');
    console.log('📧 Email:', testUser.email);
    return true;
  } else if (result.status === 409) {
    console.log('⚠️  Usuário já existe, tentando fazer login...');
    return true;
  } else {
    console.log('❌ Erro ao registrar usuário:', result.error);
    return false;
  }
}

/**
 * Faz login e obtém token de autenticação
 */
async function loginTestUser() {
  console.log('🔑 Fazendo login...');
  
  const result = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (result.success && result.data.access_token) {
    authToken = result.data.access_token;
    console.log('✅ Login realizado com sucesso!');
    console.log('🎫 Token obtido:', authToken.substring(0, 20) + '...');
    return true;
  } else {
    console.log('❌ Erro no login:', result.error);
    return false;
  }
}

/**
 * Testa a geração de uma track
 */
async function testTrackGeneration() {
  console.log('🎵 Testando geração de track...');
  
  const result = await makeRequest('POST', '/tracks/generate', testTrack, true);
  
  if (result.success) {
    createdTrackId = result.data.trackId;
    console.log('✅ Track generation iniciada com sucesso!');
    console.log('🆔 Track ID:', createdTrackId);
    console.log('⚡ Job ID:', result.data.jobId);
    console.log('⏱️  Tempo estimado:', result.data.estimatedTime);
    return true;
  } else {
    console.log('❌ Erro na geração de track:', result.error);
    return false;
  }
}

/**
 * Monitora o progresso da track
 */
async function monitorTrackProgress() {
  console.log('👀 Monitorando progresso da track...');
  
  for (let i = 0; i < 10; i++) {
    console.log(`⏳ Checagem ${i + 1}/10...`);
    
    const result = await makeRequest('GET', `/tracks/${createdTrackId}`, null, true);
    
    if (result.success) {
      const track = result.data;
      console.log(`📊 Status: ${track.status}`);
      
      if (track.status === 'COMPLETED') {
        console.log('✅ Track gerada com sucesso!');
        console.log('🎵 Audio URL:', track.audioUrl);
        console.log('🖼️  Image URL:', track.imageUrl);
        console.log('⏱️  Duração:', track.duration + 's');
        return true;
      } else if (track.status === 'FAILED') {
        console.log('❌ Geração da track falhou:', track.metadata?.error || 'Erro desconhecido');
        return false;
      }
    }
    
    // Aguarda 5 segundos antes da próxima checagem
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('⏰ Timeout - track ainda em processamento');
  return false;
}

/**
 * Lista tracks do usuário
 */
async function listUserTracks() {
  console.log('📋 Listando tracks do usuário...');
  
  const result = await makeRequest('GET', '/tracks/my', null, true);
  
  if (result.success) {
    console.log(`✅ Encontradas ${result.data.length} tracks`);
    result.data.forEach((track, index) => {
      console.log(`  ${index + 1}. ${track.title} (${track.status})`);
    });
    return true;
  } else {
    console.log('❌ Erro ao listar tracks:', result.error);
    return false;
  }
}

/**
 * Testa análise de tendências
 */
async function testTrendsAnalysis() {
  console.log('📈 Testando análise de tendências...');
  
  const result = await makeRequest('GET', '/trends', null, true);
  
  if (result.success) {
    console.log(`✅ Encontradas ${result.data.length} tendências`);
    result.data.slice(0, 3).forEach((trend, index) => {
      console.log(`  ${index + 1}. #${trend.hashtag} (${trend.videoCount} videos)`);
    });
    return true;
  } else {
    console.log('❌ Erro ao buscar tendências:', result.error);
    return false;
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('🚀 Iniciando testes do MangoBeat AI Backend...\n');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'User Registration', fn: registerTestUser },
    { name: 'User Login', fn: loginTestUser },
    { name: 'Track Generation', fn: testTrackGeneration },
    { name: 'Track Progress Monitoring', fn: monitorTrackProgress },
    { name: 'List User Tracks', fn: listUserTracks },
    { name: 'Trends Analysis', fn: testTrendsAnalysis },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📝 Teste: ${test.name}`);
    console.log('='.repeat(50));
    
    const startTime = Date.now();
    const success = await test.fn();
    const duration = Date.now() - startTime;
    
    results.push({ name: test.name, success, duration });
    
    console.log(`⏱️  Duração: ${duration}ms`);
    console.log(success ? '✅ PASSOU' : '❌ FALHOU');
  }
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  
  let passed = 0;
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
    if (result.success) passed++;
  });
  
  console.log(`\n📈 Resultado: ${passed}/${results.length} testes passaram`);
  
  if (passed === results.length) {
    console.log('🎉 Todos os testes passaram! Sistema funcionando perfeitamente!');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executa os testes
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };