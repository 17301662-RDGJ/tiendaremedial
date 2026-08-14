namespace Ordering.API.Infrastructure;

public sealed class BasketClient(HttpClient httpClient)
{
    public async Task<BasketDto?> GetAsync(string basketId, CancellationToken ct)
    {
        using var response = await httpClient.GetAsync($"basket/{Uri.EscapeDataString(basketId)}", ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        var envelope = await response.Content.ReadFromJsonAsync<GetBasketResponse>(cancellationToken: ct);
        return envelope?.Cart;
    }

    public async Task DeleteAsync(string basketId, CancellationToken ct)
    {
        using var response = await httpClient.DeleteAsync($"basket/{Uri.EscapeDataString(basketId)}", ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return;
        response.EnsureSuccessStatusCode();
    }
}

public sealed record GetBasketResponse(BasketDto Cart);
public sealed record BasketDto(string UserName, List<BasketItemDto> Items);
public sealed record BasketItemDto(int Quantity, decimal Price, Guid ProductId, string ProductName);
