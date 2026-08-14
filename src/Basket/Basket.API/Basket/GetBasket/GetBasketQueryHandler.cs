using Basket.API.Data;
using Basket.API.Models;
using BuildingBlocks.CQRS;
using Marten.Linq.QueryHandlers;

namespace Basket.API.Basket.GetBasket
{
    public record GetBasketQuery(string UserName) : IQuery<GetBasketResult>;
    public record GetBasketResult(ShoppingCart Cart);
    public class GetBasketQueryHandler(IBasketRepository repository) : IqueryHandler<GetBasketQuery, GetBasketResult>
    {
        public async Task<GetBasketResult> Handle(GetBasketQuery query, CancellationToken cancellationToken)
        {
            var basket = await repository.GetBasket(query.UserName);
            return new GetBasketResult(basket);
        }
    }
}
