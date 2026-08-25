const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Ensure JSON file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]');
}

const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Helper HTML Page Wrapper (Centers content)
    const renderPage = (title, content) => `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f4f4f9; }
                .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 350px; text-align: center; }
                form { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                button { padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; text-align: left; }
                th { background: #eee; }
                a { display: inline-block; margin-top: 15px; color: #007bff; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="card">${content}</div>
        </body>
        </html>
    `;

    // 1 & 2. GET / -> Welcome Message & Form
    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderPage('Welcome', `
            <h2>Welcome Student!</h2>
            <form action="/add-student" method="POST">
                <input type="text" name="name" placeholder="Student Name" required />
                <input type="text" name="rollNo" placeholder="Roll Number" required />
                <input type="text" name="course" placeholder="Course" required />
                <input type="email" name="email" placeholder="Email" required />
                <button type="submit">Add Student</button>
            </form>
            <a href="/students">View Records</a>
        `));
    }

    // 3. POST /add-student -> Save Record
    else if (url === '/add-student' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const formData = querystring.parse(body);
            const students = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
            students.push(formData);

            fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
            res.writeHead(302, { 'Location': '/students' });
            res.end();
        });
    }

    // 4. GET /students -> View Records
    else if (url === '/students' && method === 'GET') {
        const students = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
        const rows = students.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.rollNo}</td>
                <td>${s.course}</td>
                <td>${s.email}</td>
            </tr>
        `).join('');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderPage('Student List', `
            <h2>Student Records</h2>
            ${students.length ? `
                <table>
                    <tr><th>Name</th><th>Roll</th><th>Course</th><th>Email</th></tr>
                    ${rows}
                </table>
            ` : '<p>No records found.</p>'}
            <a href="/">Add New Student</a>
        `));
    }

    // 404 Route
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});