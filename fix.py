import os, glob

for f in glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True):
    if not os.path.isfile(f) or 'mock-firebase.ts' in f or 'firebase.ts' in f: continue
    
    content = open(f, 'r', encoding='utf-8').read()
    
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if 'import' in line and '@/lib/firebase' in line:
            # We might have something like import { db, collection, addDoc } from '@/lib/firebase';
            import_match = line.replace('import {', '').split('} from')[0].strip()
            vars = [v.strip() for v in import_match.split(',')]
            
            lib_vars = [v for v in vars if v in ['db', 'auth', 'app', 'googleProvider']]
            fs_vars = [v for v in vars if v not in lib_vars and v not in ['onAuthStateChanged', 'signInWithPopup', 'signOut', 'User', 'signInAnonymously', 'setMockUser']]
            auth_vars = [v for v in vars if v in ['onAuthStateChanged', 'signInWithPopup', 'signOut', 'signInAnonymously']]
            
            if lib_vars:
                new_lines.append(f"import {{ {', '.join(lib_vars)} }} from '@/lib/firebase';")
            if fs_vars:
                new_lines.append(f"import {{ {', '.join(fs_vars)} }} from 'firebase/firestore';")
            if auth_vars:
                new_lines.append(f"import {{ {', '.join(auth_vars)} }} from 'firebase/auth';")
        else:
            new_lines.append(line)
            
    open(f, 'w', encoding='utf-8').write('\n'.join(new_lines))
