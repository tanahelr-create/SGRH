require('dotenv').config();
const express = require('express');
const cors = require('cors');
const invitationRoutes = require('./routes/invitation.routes');
const authRoutes = require('./routes/auth.routes');
const statsRoutes = require('./routes/stats.routes');
const notificationRoutes = require('./routes/notification.routes');
const userRoutes = require('./routes/user.routes');
const congeRoutes = require('./routes/conge.routes');
const activityLogRoutes = require('./routes/activityLog.routes');
const personnelRoutes = require('./routes/personnel.routes');
const otpRoutes = require('./routes/otp.routes');
const registerRoutes = require('./routes/register.routes');
const pendingAccountRoutes = require('./routes/pendingAccount.routes');
const accountAdminRoutes = require('./routes/accountAdmin.routes');
const permissionRoutes = require('./routes/permission.routes');
const carriereRoutes = require('./routes/carriere.routes');
const corbeilleRoutes = require('./routes/corbeille.routes');
const siteSettingsRoutes = require('./routes/siteSettings.routes');
const siteTextsRoutes = require('./routes/siteTexts.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/invitations', invitationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/pending-accounts', pendingAccountRoutes);
app.use('/api/account-admin', accountAdminRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/carriere', carriereRoutes);
app.use('/api/corbeille', corbeilleRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/site-texts', siteTextsRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Serveur RH démarré sur le port ${PORT}`));