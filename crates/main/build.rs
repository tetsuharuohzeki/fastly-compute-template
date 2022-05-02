use std::process::Command;

fn main() {
    let git_output = Command::new("git")
        .args(&["rev-parse", "HEAD"])
        .output()
        .expect("could get git commit hash");

    let git_hash = String::from_utf8(git_output.stdout)
        .unwrap_or_else(|_| "[could not get git-commit-hash]".to_string());
    println!("cargo:rustc-env=GIT_HASH={}", git_hash);

    let date_output = Command::new("date")
        .args(&["+%Y/%m/%d %H:%M:%S %z"])
        .output()
        .expect("could not get date");
    let build_date = String::from_utf8(date_output.stdout)
        .unwrap_or_else(|_| "[could not built-date]".to_string());
    println!("cargo:rustc-env=BUILD_DATE={}", build_date);
}
