/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'setting/sm/ui/js/models/ClusterModel',
    'setting/sm/ui/js/views/ClusterEditView'
], function (_, Backbone, ClusterModel, ClusterEditView) {
    var prefixId = smConstants.CLUSTER_PREFIX_ID;

    var ClusterView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var hashParams = viewConfig['hashParams']
            if (hashParams['cluster_id'] != null) {
                this.renderCluster(hashParams['cluster_id']);
            } else {
                this.renderClustersList();
            }
        },

        renderClustersList: function () {
            var directoryTemplate = contrail.getTemplate4Id(smConstants.SM_PREFIX_ID + "-template"),
                gridElId = '#' + prefixId + '-results';

            this.$el.html(directoryTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smLabels.TITLE_CLUSTERS
                    },
                    advanceControls: headerActionConfig
                },
                columnHeader: {
                    columns: smGridConfig.CLUSTER_COLUMNS
                },
                body: {
                    options: {
                        actionCell: rowActionConfig,
                        detail: {
                            template: $('#sm-grid-2-row-group-detail-template').html(),
                            templateConfig: detailTemplateConfig
                        }
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: {
                                url: smUtils.getObjectDetailUrl(prefixId, prefixId)
                            }
                        }
                    }
                }
            };

            smUtils.renderGrid(gridElId, gridConfig);
        },

        renderCluster: function (clusterId) {
            var detailTemplate = contrail.getTemplate4Id("sm-grid-2-row-group-detail-template"),
                clusterTemplate = contrail.getTemplate4Id("sm-cluster-template"),
                ajaxConfig = {}, that = this;
            ajaxConfig.type = "GET";
            ajaxConfig.cache = "true";
            ajaxConfig.url = smUtils.getObjectDetailUrl(smConstants.CLUSTER_PREFIX_ID, smConstants.CLUSTER_PREFIX_ID) + "&id=" + clusterId;
            that.$el.html(clusterTemplate());
            contrail.ajaxHandler(ajaxConfig, function () {
            }, function (response) {
                that.$el.find("#cluster-details").html(detailTemplate({dc: response[0], templateConfig: detailTemplateConfig}));
                requirejs(["/setting/sm/ui/js/views/ServersView.js"], function (ServersView) {
                    var serversView = new ServersView({
                        el: that.$el.find("#cluster-server-list")
                    });
                    serversView.render({serverColumnsType: smConstants.CLUSTER_PREFIX_ID, hashParams: {"cluster_id": clusterId}});
                });
            }, function () {
            });
        }
    });

    var rowActionConfig = [
        smGridConfig.getConfigureAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                clusterModel = new ClusterModel(dataItem),
                clusterEditView = new ClusterEditView({'model': clusterModel});

            clusterEditView.renderConfigure({"title": smLabels.TITLE_EDIT_CONFIG});
        }),
        smGridConfig.getAddServersAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                clusterModel = new ClusterModel(dataItem),
                clusterEditView = new ClusterEditView({'model': clusterModel});

            clusterEditView.renderAddServers({"title": smLabels.TITLE_ADD_SERVERS});
        }),
        smGridConfig.getAssignRoleAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                clusterModel = new ClusterModel(dataItem),
                clusterEditView = new ClusterEditView({'model': clusterModel});

            clusterEditView.renderAssignRoles({"title": smLabels.TITLE_ASSIGN_ROLES});
        }),
        smGridConfig.getProvisionAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + '-results').data('contrailGrid')._dataView.getItem(rowIndex),
                clusterModel = new ClusterModel(dataItem),
                clusterEditView = new ClusterEditView({'model': clusterModel});

            clusterEditView.renderProvision({"title": smLabels.TITLE_PROVISION_CLUSTER});
        }),
        smGridConfig.getDeleteAction(function (rowIndex) {
            console.log(rowIndex);
        })
    ];

    var detailTemplateConfig = [
        [
            {
                title: smLabels.TITLE_DETAILS,
                keys: ['id', 'email']
            },
            {
                title: smLabels.TITLE_OPENSTACK,
                keys: ['parameters.openstack_mgmt_ip', 'parameters.gateway', 'parameters.subnet_mask', 'parameters.keystone_tenant', 'parameters.keystone_username']
            },
            {
                title: smLabels.TITLE_CONTRAIL,
                keys: ['parameters.analytics_data_ttl', 'parameters.haproxy', 'parameters.multi_tenancy', 'parameters.use_certificates', 'parameters.external_bgp', 'parameters.encapsulation_priority', 'parameters.router_asn', 'parameters.database_dir']
            }
        ],
        [
            {
                title: smLabels.TITLE_SERVERS_CONFIG,
                keys: ['parameters.domain', 'parameters.gateway', 'parameters.subnet_mask', 'parameters.base_image_id', 'parameters.package_image_id']
            },
            {
                title: smLabels.TITLE_STORAGE,
                keys: ['parameters.uuid', 'parameters.storage_virsh_uuid', 'parameters.storage_fsid']
            },
            {
                title: smLabels.TITLE_STATUS,
                keys: ['status.new_servers', 'status.registered_servers', 'status.configured_servers', 'status.provisioned_servers', 'status.total_servers']
            }
        ]
    ];

    var headerActionConfig = [
        {
            "type": "link",
            "title": smLabels.TITLE_DEL_CLUSTERS,
            "iconClass": "icon-trash",
            "onClick": function () {
            }
        },
        {
            "type": "link",
            "title": smLabels.TITLE_ADD_CLUSTER,
            "iconClass": "icon-plus",
            "onClick": function () {
                var clusterModel = new ClusterModel(),
                    clusterEditView = new ClusterEditView({'model': clusterModel});

                clusterEditView.renderConfigure({"title": smLabels.TITLE_ADD + ' ' + smLabels.TITLE_CLUSTER});
            }
        }
    ];
    return ClusterView;
});