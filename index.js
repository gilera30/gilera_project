const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const { sequelize, bcrypt, Op, Role, User, Qualification, Record, Course } = require('./models');

const RecordStatus = ['accept', 'awaiting', 'reject'];
const app = express();

app.use(session({
    secret: 'uUCKVDtDcwwUuUFHASi/tJuzR76ZrQmxcWs8dcHMSr0=',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 48 * 60 * 60 * 1000,
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'hbs');
hbs.registerHelper('ifEquals', function(a, b, opts) {
    if (a == b) {
        return opts.fn(this);
    } 
    else {
        return opts.inverse(this);
    }
});

async function isAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

async function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role_id == 2) {
        next();
    } else {
        res.redirect('/lk');
    }
}

app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/login', async (req, res) => {
    if (!req.session.user) {
        res.render('login');
    } else {
        res.redirect('/lk');
    }
});

app.get('/register', async (req, res) => {
    if (!req.session.user) {
        const qualifications = await Qualification.findAll();
        res.render('register', { qualifications });
    } else {
        res.redirect('/lk');
    }
});

app.get('/courses', async (req, res) => {
    if (req.session.user) {
        const courses = await Course.findAll({ include: [{ model: Record, where: { user_id: req.session.user.id }, required: false}]});
        res.render('courses', { courses });
    }
    else {
        const courses = await Course.findAll();
        res.render('courses', { courses });
    }
});

app.get('/courses/search', async (req, res) => {
    const { query } = req.query;
    if (req.session.user) {
        const courses = await Course.findAll({ where: { name: { [Op.iLike]: `%${query.toLowerCase()}%` } }, include: [{ model: Record, where: { user_id: req.session.user.id }, required: false}]});
        res.render('search', { query: query, courses });
    }
    else {
        const courses = await Course.findAll({ where: { name: { [Op.iLike]: `%${query.toLowerCase()}%` } } });
        res.render('search', { query: query, courses });
    }
});

app.get('/lk', isAuth, async (req, res) => {
    const isAdmin = req.session.user.role_id == 2;
    if (isAdmin) {
        res.render('lk', { user: req.session.user, admin: isAdmin });
    }
    else {
        const courses = await Course.findAll({ include: [{ model: Record, where: { user_id: req.session.user.id }}]});
        res.render('lk', { user: req.session.user, courses });
    }
})

app.get('/admin', isAdmin, async (req, res) => {
    const usersAll = await User.findAll({ include: [{ model: Qualification, attributes: ['name'], }, { model: Role, attributes: ['name'] }] });
    const recordsAll = await Record.findAll();
    const courseAll = await Course.findAll();
    const qualificationAll = await Qualification.findAll();
    res.render('admin.hbs', { users: usersAll, records: recordsAll, courses: courseAll, qualifications: qualificationAll });
})

app.post('/records/send/:id', isAuth, async (req, res) => {
    const { id } = req.params;
    if (req.session.user.role_id == 2) {
        res.json({error: 'Администратор не может записаться на курс'})
    }
    else {
        await Record.create({
            user_id: req.session.user.id,
            course_id: id,
            status: RecordStatus[1],
        })
        res.redirect('/lk');
    }
})

app.post('/records/apply/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    await Record.update({
        status: 'accept'
    }, { where: { id: id } })
    res.redirect('/admin');
})

app.post('/records/reject/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    await Record.update({
        status: 'reject'
    }, { where: { id: id } })
    res.redirect('/admin');
})

app.post('/register', async (req, res) => {
    const { name, phone, login, password, repeat_password, qualification_id } = req.body;
    if (password == repeat_password) {
        const fio = name.trim().split(/\s+/);
        const newUser = await User.create({
            firstName: fio[1],
            lastName: fio[0],
            middleName: fio[2],
            phone: phone,
            login: login,
            password: password,
            qualification_id: qualification_id,
            role_id: 1,
        })
        let sessionData = {
            id: newUser.id,
            login: newUser.login,
            phone: newUser.phone,
            role_id: newUser.role_id,
        }
        req.session.user = sessionData;
        res.redirect('/lk');
    }
    else {
        res.json({ 'error': 'Пароли не совпадают' })
    }
})

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    const findUser = await User.findOne({ where: { login: login } });
    if (!findUser) {
        return res.status(400).json({ message: 'Пользователь не найден' });
    }
    const isValidPassword = await bcrypt.compare(password, findUser.password);
    if (isValidPassword) {
        let sessionData = {
            id: findUser.id,
            login: findUser.login,
            phone: findUser.phone,
            role_id: findUser.role_id,
        }
        req.session.user = sessionData;
        if (findUser.role_id == 2) {
            res.redirect('/admin');
        } else {
            res.redirect('/lk');
        }
    } else {
        res.status(400).json({ message: 'Пароль не верен' });
    }
})

app.post('/lk-update', isAuth, async (req, res) => {
    const { login, phone } = req.body;
    const userUpdated = await User.findOne({ where: { id: req.session.user.id } });
    userUpdated.login = login;
    userUpdated.phone = phone;
    await userUpdated.save();
    let sessionData = {
        id: userUpdated.id,
        login: userUpdated.login,
        phone: userUpdated.phone,
        role_id: userUpdated.role_id,
    }
    req.session.user = sessionData;
    res.redirect('/lk');
})

app.post('/logout', isAuth, async (req, res) => {
    req.session.destroy(function () {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
})

app.post('/destroy', isAuth, async (req, res) => {
    await User.destroy({ where: req.session.user.id });
    req.session.destroy(function () {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
})

;(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const role = await Role.create({
        name: 'user'
    });
    const role2 = await Role.create({
        name: 'admin'
    });
    const qualification = await Qualification.create({
        name: 'Фельдшер',
    })
    const qualification2 = await Qualification.create({
        name: 'Невролог',
    })
    await User.create({
        firstName: 'Аркадий',
        lastName: 'Наумов',
        middleName: 'Платонович',
        phone: '79304038259',
        login: 'root',
        password: 'root',
        qualification_id: qualification.id,
        role_id: role2.id,
    });
    const user = await User.create({
        firstName: 'Ирина',
        lastName: 'Воробьёва',
        middleName: 'Рудольфовна',
        phone: '79585531888',
        login: 'user',
        password: 'user',
        qualification_id: qualification2.id,
        role_id: role.id,
    });
    await Course.create({
        name: 'Продвинутая сердечно-легочная реанимация (ACLS)',
        duration: 144,
        price: 15000.00,
    })
    await Course.create({
        name: 'Продвинутая педиатрическая сердечно-легочная реанимация (PALS)',
        duration: 144,
        price: 15000.00,
    })
    await Course.create({
        name: 'Управление травмой',
        duration: 144,
        price: 15000.00,
    })
    const course4 = await Course.create({
        name: 'Управление неотложными состояниями',
        duration: 144,
        price: 15000.00,
    })
    await Course.create({
        name: 'Медицинская токсикология',
        duration: 144,
        price: 15000.00,
    })
    await Record.create({
        user_id: user.id,
        course_id: course4.id,
        status: RecordStatus[0],
    })
})();

app.listen(80);