const fs = require('fs');

let userContent = fs.readFileSync('src/app/components/UserDashboard.jsx', 'utf8');

// Ensure Download is imported properly
userContent = userContent.replace("} from 'lucide-react';", ", Download } from 'lucide-react';");

// Clean up if it was already modified before
userContent = userContent.replace(", Download, Download }", ", Download }");

fs.writeFileSync('src/app/components/UserDashboard.jsx', userContent);
