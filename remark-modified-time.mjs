import { execFileSync } from "child_process";
import { statSync } from "fs";

export function remarkModifiedTime() {
    return function (_, file) {
        const filepath = file.history[0];
        try {
            const result = execFileSync("git", [
                "log",
                "-1",
                "--pretty=format:%cI",
                "--",
                filepath,
            ]);
            if (result && result.toString().trim()) {
                file.data.astro.frontmatter.lastModified = result.toString().trim();
            } else {
                // Fallback if file is not in git yet
                const stat = statSync(filepath);
                file.data.astro.frontmatter.lastModified = stat.mtime.toISOString();
            }
        } catch (e) {
            // Fallback if git fails entirely
            const stat = statSync(filepath);
            file.data.astro.frontmatter.lastModified = stat.mtime.toISOString();
        }
    };
}
