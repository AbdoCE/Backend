
/**
 * The function generates a UUID (Universally Unique Identifier) using JavaScript.
 * @returns a substring of the generated UUID. The substring starts at the index specified by the
 * variable "start" and ends at the index specified by the variable "end". The substring is obtained by
 * extracting the portion of the UUID string after the last occurrence of the '/' character.
 */
const uuid = () => {
    var temp_url = URL.createObjectURL(new Blob());
    var uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.split(':')[2]
}

module.exports = {
    uuid
}