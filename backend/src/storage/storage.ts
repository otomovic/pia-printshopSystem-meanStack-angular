import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profileImages');
    },

    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        cb(null, Date.now() + '.' + extension);
    }
});

export const upload = multer({ storage });

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },

    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + '.' + extension);
    }
});

export const uploadProduct = multer({ storage: productStorage });