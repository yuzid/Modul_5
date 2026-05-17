import express, { Request, Response } from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const frontendBuildPath = process.env.FRONTEND_BUILD_PATH || path.join(process.cwd(), 'frontend-build');
app.use(express.static(frontendBuildPath));

// 1. Konfigurasi Database RDS [cite: 23, 32]
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false } // Diperlukan untuk koneksi RDS luar
});

// 2. Konfigurasi S3 Client [cite: 36, 39]
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

// Middleware Multer untuk handle file di memory
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint Pendaftaran [cite: 18, 20]
app.post('/register', upload.single('ktp'), async (req: Request, res: Response) => {
    try {
        const { nama, email } = req.body;
        const file = req.file;

        if (!file || !nama || !email) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }

        // LANGKAH 1: Unggah ke Object Storage [cite: 21]
        const fileName = `pelamar/${email}${Date.now()}-${file.originalname}`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read' as const // Agar bisa diakses publik [cite: 35]
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Buat URL Publik [cite: 22]
        const ktpUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // LANGKAH 2: Simpan ke Database RDS 
        const queryText = 'INSERT INTO pelamar(nama, email, ktp_url) VALUES($1, $2, $3) RETURNING *';
        const values = [nama, email, ktpUrl];
        
        const dbResult = await pool.query(queryText, values);

        res.status(201).json({
            message: 'Pendaftaran Berhasil',
            data: dbResult.rows[0],
            ktpUrl: dbResult.rows[0].ktp_url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

// fallback for frontend routing
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});