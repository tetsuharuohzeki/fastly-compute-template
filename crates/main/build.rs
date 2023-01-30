// rust-analyzer v0.3.1386 (released in 2023, Jan., 30th) does not support this style.
// We disable this until rust-analyzer supports it.
#![allow(clippy::uninlined_format_args)]

use std::error::Error;
use std::ffi::OsStr;
use std::process::Command;

fn main() {
    let git_hash = get_command_stdout_str("git", ["rev-parse", "HEAD"])
        .unwrap_or_else(|_| "[could not get git-commit-hash]".to_string());
    println!("cargo:rustc-env=GIT_HASH={}", git_hash);

    let build_date = get_command_stdout_str("date", ["-u", "+%Y-%m-%d %T%z"])
        .unwrap_or_else(|_| "[could not built-date]".to_string());
    println!("cargo:rustc-env=BUILD_DATE={}", build_date);
}

fn get_command_stdout_str<S, I>(program: S, args: I) -> Result<String, Box<dyn Error>>
where
    S: AsRef<OsStr>,
    I: IntoIterator<Item = S>,
{
    let output = Command::new(program).args(args).output()?;
    let string = String::from_utf8(output.stdout)?;
    Ok(string)
}
