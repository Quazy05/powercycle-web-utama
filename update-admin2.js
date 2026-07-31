const fs = require('fs');
let content = fs.readFileSync('src/app/components/AdminDashboard.jsx', 'utf8');

// The line is currently:
// {onDeleteDokumentasi && (!role || role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'admin portal') && (

// Let's replace it with a condition that allows admin llk and admin sis to delete too
const oldCondition = "{onDeleteDokumentasi && (!role || role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'admin portal') && (";
const newCondition = "{onDeleteDokumentasi && (true) && ("; // Wait, in AdminDashboard.jsx, anyone who has access to AdminDashboard is an admin of some sort. Let's just remove the role restriction or make it explicitly check for admin variants.

content = content.replace(oldCondition, "{onDeleteDokumentasi && (!role || role.toLowerCase().includes('admin')) && (");

fs.writeFileSync('src/app/components/AdminDashboard.jsx', content);
