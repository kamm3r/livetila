# Livetila domain

A competition contains events. An event can appear in several event-list rows,
one per round. `EventId` identifies the event; the row's `Id` distinguishes those
rows. Search navigation uses the event ID, while list selection uses the row ID.

A round contains heats. Round and heat `Index` values are identifiers and may be
non-contiguous. Competition links encode the round category, such as `Qualify`
or `Final`. Existing OBS links encode one-based positions in the round and heat
arrays. These formats remain compatible through the competition-selection module.

A search workflow includes competition selection, event filtering, progressive
result reveal and four recently selected result links. History is optional:
unavailable browser storage must not prevent search or navigation.

Live results and event status refresh every second without waiting for an event
to be marked in progress. The competition view polls in the foreground; OBS also
polls in the background. The interval is not an end-to-end freshness guarantee:
the upstream cache, network and browser scheduling can add latency.

Failed refreshes retain the last successful data and current viewing state. Only
initial failures without cached data replace the view with an error. A status
message marks interrupted updates until a successful refresh clears it.
