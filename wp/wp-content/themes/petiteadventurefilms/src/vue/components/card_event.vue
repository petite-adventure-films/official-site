<template>
    <router-link
    :to="{ name: 'event', params: { id: item.id  } }">
        <h2>
            <span class="block caption2">No.{{item.custom_fields.events_info_17}}</span>
            {{item.title.rendered}}
        </h2>
        <ul class="list_post_info">
            <li>
                <span class="index date">
                    {{item.custom_fields.events_info_15}}
                    <span v-if="item.custom_fields.events_info_16">
                         - {{item.custom_fields.events_info_16}}
                    </span>
                </span>
            </li>
            <li class="index place">
                {{item.custom_fields.events_info_01}}
                : {{item.custom_fields.events_info_02}}
            </li>
            <li class="index place">
                {{item.custom_fields.events_info_01}}
                : {{item.custom_fields.events_info_02}}
            </li>
        </ul>
    </router-link>
</template>
<script>

export default {
    props: ['item']
    
    
}
</script>