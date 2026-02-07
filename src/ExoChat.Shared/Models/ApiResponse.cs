using System.Text.Json.Serialization;

namespace ExoChat.Shared.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };
    public static ApiResponse<T> Fail(string error) => new() { Success = false, Errors = new List<string> { error } };
    public static ApiResponse<T> Fail(List<string> errors) => new() { Success = false, Errors = errors };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok() => new() { Success = true };
    public new static ApiResponse Fail(string error) => new() { Success = false, Errors = new List<string> { error } };
}
