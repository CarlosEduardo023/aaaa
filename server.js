const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importar o pacote CORS

const app = express();
app.use(bodyParser.json());

// Configuração do CORS
app.use(cors());

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'faltas'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Rota para buscar turmas que o professor leciona
app.get('/turmas/:professorId', (req, res) => {
    const professorId = req.params.professorId;

    const sql = `
        SELECT t.id_turma, t.nome_turma 
        FROM Turma t
        JOIN Turma_Disciplina td ON t.id_turma = td.id_turma
        JOIN Prof_Disciplina pd ON td.id_disciplina = pd.id_disciplina
        WHERE pd.id_prof = ?
    `;

    db.query(sql, [professorId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar turmas:', err);
            return res.status(500).send('Erro ao buscar turmas');
        }
        res.json(results);
    });
});

// Rota para buscar disciplinas que o professor leciona em uma turma específica
app.get('/disciplinas/:professorId/:turmaId', (req, res) => {
    const { professorId, turmaId } = req.params;

    const sql = `
        SELECT d.id_disciplina, d.disciplina 
        FROM Disciplina d
        JOIN Prof_Disciplina pd ON d.id_disciplina = pd.id_disciplina
        JOIN Turma_Disciplina td ON d.id_disciplina = td.id_disciplina
        WHERE pd.id_prof = ? AND td.id_turma = ?
    `;

    db.query(sql, [professorId, turmaId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar disciplinas:', err);
            return res.status(500).send('Erro ao buscar disciplinas');
        }
        res.json(results);
    });
});

// Rota para buscar alunos de uma turma em uma disciplina específica
app.get('/alunos/:turmaId/:disciplinaId', (req, res) => {
    const { turmaId, disciplinaId } = req.params;

    const sql = `
        SELECT a.id_aluno, a.nome_aluno 
        FROM Aluno a
        JOIN Aluno_disciplina ad ON a.id_aluno = ad.id_aluno
        WHERE a.id_turma = ? AND ad.id_disciplina = ?
    `;

    db.query(sql, [turmaId, disciplinaId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar alunos:', err);
            return res.status(500).send('Erro ao buscar alunos');
        }
        res.json(results);
    });
});

// Rota para registrar presença ou ausência dos alunos
app.post('/registrar-presenca', (req, res) => {
    const { id_disciplina, alunos, data_falta } = req.body;

    const sql = `
        INSERT INTO Faltas (id_disciplina, id_aluno, data_falta, presente, academic_year) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE presente = VALUES(presente)
    `;

    alunos.forEach(aluno => {
        const { id_aluno, presente } = aluno;
        const academicYear = new Date().getFullYear();

        db.query(sql, [id_disciplina, id_aluno, data_falta, presente, academicYear], (err, result) => {
            if (err) {
                console.error('Erro ao registrar presença:', err);
                return res.status(500).send('Erro ao registrar presença');
            }
        });
    });

    res.send('Presença registrada com sucesso!');
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
